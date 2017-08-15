

define(function(require, exports, module){
    var util = require('test')
    console.log(util)
    util.log('我是模块主代码，我加载好了')
    return 111
})