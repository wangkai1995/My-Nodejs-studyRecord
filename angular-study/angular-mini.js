
var Utils = {
    toString:Object.prototype.toString,
    clone:function(obj){
        var isObj = this.isObject(obj);
        var isArray = this.isArray(obj);
        var result;
        if(isObj){
            result = {};
            for(var key in obj){
                if( this.isObject(obj[key]) || this.isArray(obj[key])  ){
                    result[key] = this.clone(obj[key]);
                }else{
                    result[key] = obj[key];
                }
            }
        }else if(isArray){
            result = [];
            for(var key=0; key<obj.length; key++){
                if( this.isObject(obj[key]) || this.isArray(obj[key])  ){
                    result.push( this.clone(obj[key]) );
                }else{
                    result.push( obj[key] );
                }
            }
        }else{
            return obj;
        }
        return result;
    },
    isObject:function(obj){
        if(this.toString.call(obj) === '[object Object]' || obj.constructor === Object){
            return true;
        }
        return false;
    },
    isArray:function(arr){
        if(Array.isArray){
            return Array.isArray(arr);
        }
        return this.toString.call(arr) === '[object Array]';
    },
    equals: function(last, current){
       if( this.toString.call(last) !== this.toString.call(current) ){
            return false;
       }
       var isObj = this.isObject(current);
       var isArray = this.isArray(current);

       if(isObj){
            for(var key in current){
                if( !this.equals(last[key],current[key]) ){
                    return false;
                }
            }
       }else if(isArray){
            if(current.length !== last.length ){
                return false;
            }
            for(var key=0; key<current.length;key++){
                 if( !this.equals(last[key],current[key]) ){
                    return false;
                }
            }
       }else{
            return last === current;
       }

       return true;
    }
};







//作用域
var Scope = function(parent,id){
    this.$$watchers = [];
    this.$$children = [];
    this.$parent = parent;
    this.$id = id || 0;
}
Scope.counter = 0;

//监听者
Scope.prototype.$watch = function(exp,fn){
    this.$$watchers.push({
        exp: exp,
        fn: fn,
        //表达式最后一次执行的结果
        last: Utils.clone(this.$eval(exp))
    });
};

//建立个新对象
Scope.prototype.$new = function(){
    Scope.counter += 1;
    var obj = new Scope(this, Scope.counter);
    //设置原型链
    Object.setPrototypeOf(obj,this);
    this.$$children.push(obj);
    return obj;
}

//scope.prototype.$destroy
Scope.prototype.$destroy = function(){
    var pc = this.$parent.$$children;
    pc.splice(pc.indexOf(this) ,1);
}

//脏检测
Scope.prototype.$digest = function(){
    var dirty, watcher, current ,i;
    do{
        dirty = false;
        for(i=0; i<this.$$watchers.length ;i++){
            //获得观察者
            watcher = this.$$watchers[i];
            //运行表达式获取当前值
            current = this.$eval(watcher.exp);
            //检查结果值是否不相当
            if( !Utils.equals(watcher.last ,current) ){
                //获取克隆的值
                watcher.last = Utils.clone(current);
                //继续循环
                dirty = true;
                //更新DOM？
                watcher.fn(current);
            }
        }
    } while(dirty);
    //递归子元素
    for(i=0; i<this.$$children.length; i++){
        this.$$children[i].$digest();
    }
}

//只是测试环境使用eval
Scope.prototype.$eval = function(exp){
    var val;
    if(typeof exp === 'function'){
        val = exp.call(this);
    }else{
        try{
            with(this){
                val = eval(exp);
            }
        }catch(e){
            val = undefined;
        }
    }
    return val;
}







//提供服务和注入
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
        $rootScope: new Scope()
    }
};
//全局变量
Provider.DIRECTIVES_SUFFIX = 'Directive';
Provider.CONTROLLER_SUFFIX = 'Controller'
//注册一些directive
Provider.directive('ngl-bind',function(){
    return{
        scope: false,
        link: function(el, scope, exp){
            el.innerHTML = scope.$eval(exp);
            scope.$watch(exp,function(val){
                el.innerHTML = val;
            })
        }
    }
});
Provider.directive('ngl-model',function(){
    return{
        link:function(el,scope,exp){
            el.onkeyup = function(){
                scope[exp] = el.value;
                scope.$digest();
            };
            scope.$watch(exp,function(val){
                el.value = val;
            });
        }
    };
})
Provider.directive('ngl-controller',function(){
    return{
        scope:true,
        link:function(el,scope,exp){
            var ctrl = Provider.get(exp + Provider.CONTROLLER_SUFFIX );
            Provider.invoke(ctrl, { $scope:scope });
        }
    };
})
Provider.directive('ngl-click',function(){
    return{
        scope:false,
        link:function(el,scope,exp){
            el.onclick = function(){
                scope.$eval(exp);
                scope.$digest();
            }
        }
    }
})

/*******   test  *******/
// Provider.service('RESTfulService', function(){
//     return function(test){
//         return new Promise(function(resolve,rejected){
//             resolve(test)
//         })
//     }
// })

// Provider.controller('MainCtrl', function(RESTfulService){
//     RESTfulService('aaaaaaaaa').then(function(data){
//         console.log(data);
//     })
// })

// var ctrl = Provider.get('MainCtrl'+Provider.CONTROLLER_SUFFIX);
// Provider.invoke(ctrl);



//DOM解析
var DOMCompiler = {
    bootstrap:function(){
        this.compile(document.children[0], Provider.get('$rootScope') );
    },
    //这里传入的scope 是父节点,    根节点传入的是Provider.get('$rootScope')
    compile:function(el,scope){
        //获取某个元素上的所有指令
        //在这里获取并加入provider缓存中 
        var dirs = this._getElDirectives(el);
        var dir;
        var scopeCreated;
        dirs.forEach(function(d){
            //第二次get获取到传入的fn
            dir = Provider.get(d.name+ Provider.DIRECTIVES_SUFFIX);
            //dic.scope代表当前 directive
            if(dir.scope && !scopeCreated){
                //生成的继承scope属性
                scope = scope.$new();
                scopeCreated = true;
            }
            //参照angular源码 这里传入的el ,scope ,value
            dir.link(el, scope, d.value);
        });
        //递归子节点
        Array.prototype.slice.call(el.children).forEach(function(c){
            this.compile(c,scope);
        },this);
    },
    //...
    _getElDirectives:function(el){
        var attrs = el.attributes;
        var result = [];
        for(var i=0; i<attrs.length; i++){
            //注意这一句IF 第一次get在这里添加到缓存中
            if(Provider.get(attrs[i].name +Provider.DIRECTIVES_SUFFIX)){
                result.push({
                    name:attrs[i].name,
                    value:attrs[i].value
                });
            }
        }
        return result;
    },
};









