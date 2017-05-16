




const Mvvm = function(config){
    this.depTarget = null;
    this.$Watcher = new Watcher(this);
    this.$Observer = new Observer(this);
    //获取数据
    this._data = config.data;
    //获取元素
    this._el = config.el; 


    //根据元素生成render放入watcher
    this.initRenderWatcher = function(el){
        var dom = document.querySelector(el);
        console.log(dom);
    }

    //初始化观察者订阅
    this.initObserver = function(data){
        var self = this;
        if(data && typeof data=== 'object'){
            Object.keys(data).forEach(function(key){
                //递归订阅子数据
                self.initObserver(data[key]);
                //添加数据订阅
                self.$Observer.addObserver( data, key ,data[key]);
            })
        }
    }

    this.initObserver(this._data);
    this.initRenderWatcher(this._el);
}




