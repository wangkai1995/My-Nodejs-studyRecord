
var Watcher = function(target){
    this.$Mvvm = target;
    //双向绑定的render
    this._subRender = [];
    //初始化根据html元素解析出来的render
    this._renderCallBack = {};
}


//初始化的时候解析模板生成render
Watcher.prototype.addRender = function(render,key){
    this._renderCallBack[key] = render;
}


//添加render建立订阅
Watcher.prototype.addSub = function(render,key){
    var depTarget = this.$Mvvm.depTarget;
    //获取对应key的render 
    depTarget = this._renderCallBack[key];
    //建立双向绑定
    this._subRender.push(render);
    //清除标记
    depTarget = false;
}


//通知render执行
Watcher.prototype.notify = function(){
    //执行render
    this._subRender.forEach(function(render){
        render();
    })
}






