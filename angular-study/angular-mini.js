




//提供服务器和注入
var Provider = {
    //用来保存
    _providers :{},
    //指令
    //全局依赖
    directive: function(name,fn){
        this._register(name+Provider.DIRECTIVES_SUFFIX, fn);
    },
    //控制器
    //局部依赖
    controller: function(name,fn){
        this._register(name+Provider.CONTROLLER_SUFFIX, function(){
            return fn;
        });
    },
    //service 服务
    //全局依赖
    service: function(name,fn){
        this._register(name,fn);
    },
    //_注册
    _register:function(name,factory){
        this._providers[name] = factory;
    },
    //获取
    get:function(name, locals){
        //如果缓存里有结果
        if(this._cache[name]){
            return this._cache[name];
        }
        //获取到注册的函数
        var provider = this._providers[name];
        if(!provider && typeof provider !== 'function'){
            return null;
        }
        //执行函数并且结果加入缓存
        return (this._cache[name] = this.invoke(provider,locals))
    },
    //处理注释
    annotate:function(fn,locals){
        var res = fn.toString()
            .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,'')
            .match(/\((.*?)\)/);
        if(res && res[1]){
            return res[1].split(',').map(function(d){
                return d.trim();
            })
        }
        return [];
    },
    //唤起调用
    invoke:function(fn,locals){
        locals = locals || {};
        var deps = this.annotate(fn).map(function(s){
            return locals[s] || this.get(s,locals);
        },this);
        return fn.apply(null,deps);
    },
    //缓存
    _cache:{ 
        // $rootScope: new Scope()
    }
}
//全局变量
Provider.DIRECTIVE_SUFFIX = 'Directive';
Provider.CONTROLLER_SUFFIX = 'Controller'





/*******   test  *******/
Provider.service('RESTfulService', function(){
    return function(test){
        return new Promise(function(resolve,rejected){
            resolve(test)
        })
    }
})

Provider.controller('MainCtrl', function(RESTfulService){
    RESTfulService('aaaaaaaaa').then(function(data){
        console.log(data);
    })
})

var ctrl = Provider.get('MainCtrl'+Provider.CONTROLLER_SUFFIX);
Provider.invoke(ctrl);


