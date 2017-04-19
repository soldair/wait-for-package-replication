var path = require('path')
var request = require('request')
var getAuthToken = require('registry-auth-token')
var getRegistryUrl = require('registry-auth-token/registry-url')

module.exports = function (opts, cb) {
  var maxLoops = 20

  // can look for a particular version
  var version = opts.version
  // or can return when the page has been changed in the last N seconds
  var changedWindow = opts.window || 60

  var pkg = opts.package

  var registry = getRegistryUrl()
  if (pkg.indexOf('@') === 0) {
    registry = getRegistryUrl(pkg.split('/')[0])
  }

  var token = getAuthToken(registry)

  var headers = {
    'accept': 'application/vnd.npm.install-v1+json'
  }

  if (token) {
    headers.authorization = 'Bearer ' + token.token
  }

  var reqOpts = {
    url: registry+pkg.replace('/', '%2f'),
    headers: headers
  }

  var delay = 1000

  loop()

  function loop () {
    if (!--maxLoops) return cb(new Error('max loops exceded without result.'))
    backoff()

    request(reqOpts, function (err, res, body) {
      var obj = json(body)

      if (err || res.statusCode !== 200 || !obj) {
        if(opts.verbose) {
          console.log('err loading document',reqOpts.url,res.statusCode,err+'')
        }
        setTimeout(function () {
          loop()
        }, delay)
        return;
      }


      if (version) {
        if (obj.versions[version]) {
          return cb(null, obj)
        }
      } else {
        var lastChange = Date.parse(obj.modified || obj.time.modified)
        // the last change replicated for this module is > than changedWindow seconds ago
        if (lastChange > Date.now() - (changedWindow * 1000)) {
          return cb(null, obj)
        }
      }
      if(opts.verbose){
        console.log('no change found in '+reqOpts.url+" status: "+res.statusCode+' headers:'+JSON.stringify(res.headers))
      }

      return setTimeout(function () {
        loop()
      }, delay)
    })
  }

  function backoff(){
    delay = Math.floor(delay+(delay/3))
    if(delay > 5000) delay = 5000;
  }
}

function json (s) {
  try {
    return JSON.parse(s)
  } catch (e) {}
}
