var wait = require('../')

var test = require('tape')


test('can',function(t){
  wait({
    package:'@types/angular',
    version:'1.5.13'
  },function(err,data){
    t.ok(!err,'should not have error')
    t.equals(data.name,'@types/angular','should be object')
    t.end()
  })
})




