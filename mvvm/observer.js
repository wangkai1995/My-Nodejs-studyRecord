

var Observer = function(target){
    this.$Mvvm = target;
}


Observer.prototype.addObserver = function(obj,key,val){
    var watcher = this.$Mvvm.$Watcher;
    var depTarget = this.$Mvvm.depTarget;


    Object.defineProperty(obj,key,{
        enumerable:true,
        configurable: false,
        set:function(newVal){
            if(val === newVal){return;}
            val = newVal;
            //通知watcher开始执行render
            watcher.notify();
        },
        get:function(){
            //通知watcher将数据绑定到对应render
            depTarget && watcher.addSub(depTarget,key);
            return val;
        }
    })

}

