# wait-for-package-replication
Poll package endpoint after publish for modified time to change.

Depending on your region published changes may take longer to replicate to our edge caches.

Run this if you need to install a version immediately after publishing to guarantee that the new version is available.

```
npm install -g wait-for-package-replication
```

this works with public scoped and private modules by reading your .npmrc

## cli use

```
npm publish somemodule
wait-for-package-replication -p somemodule
cd otherplace
npm install somemodule@latest
```

the default is to return if the metadata has been updated within the last 60 seconds. you can specify version or a different time window

check out `wait-for-package-replication --help`

## also in code

```js
var wait = require('../')


test('can',function(t){
  wait({
    package:'@types/angular',
    version:'1.5.13'
  },function(err,data){
    t.ok(!err,'should not have error')
    t.equals(data.name,'@types/angular','should be object')
    t.end()
  })
}

```

todo document options =) for now you'll have to look at the bin.

