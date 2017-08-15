






define(function(require, exports, module){
    var _prefix = '我想说：';
    module.exports = {
        log:function(msg){ console.log(_prefix +msg)}
    }
    //这里的返回值会导致
    /*  
        不为空 所以拿到的是222
        这里也可以不返回module.exports 这种形式 直接返回个对象包含的方法也可以
        if(exports === undefined){
            exports = mod.exports
        }
    */
    // return 222
})










