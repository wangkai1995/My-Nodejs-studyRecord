

//存储实例化的对象
var cachedMods = {};
var anonymousMeta;



var loadderDir = (function(){
    function dirname(path){
        return path.match(/[^?#]*\//)[0];
    }
    //拿到引用的script节点
    var scripts = document.scripts
    var ownScript = scripts[scripts.length -1];
    var src = ownScript.hasAttribute? ownScript.src: ownScript.getAttribute('src',4);
    return dirname(src);
})()




function request(url,callback){
    var head = document.getElementsByTagName('head')[0];
    var baseElement = head.getElementsByTagName('base')[0];
    var node = document.createElement('script');
    var supportOnload = 'onload' in node;
    if(supportOnload){
        node.onload = function(){
            callback();
        }
    }else{
        node.onreadystatechange = function(){
            if(/loaded|complete/.test(node.readyState)){
                callback();
            }
        }
    }
    node.async = true;
    node.src = url;
    //ie6一下的特殊处理 插入到base之前
    baseElement? head.insertBefore(node, baseElement): head.appendChild(node);
}




//解析依赖
function parseDependencies(code){
    var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\//r/n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
    var SLASH_RE = /\\\\/g;

    var ret = [];
    code.replace(SLASH_RE,'')
        .replace(REQUIRE_RE,function(m,m1,m2){
            if(m2){
                ret.push(m2);
            }
        })
    return ret;
}




function define(factory){
    //使用正则分析获取对应的依赖模块
    var deps = parseDependencies(factory.toString());
    var meta = {
        deps:deps,
        factory: factory
    }
    //存到一个全局变量,在后面fetch在script的onload回调里获取
    anonymousMeta = meta;
}




//模块类
function Module(url,deps){
    this.url = url;
    this.dependencies = deps || [];
    this.factory = null;
    this.status = 0;

    //被哪些模块依赖
    this._waitings = {}

    //依赖的模块有哪些没加载好
    this._remain = 0;
}




var STATUS = Module.STATUS = {
    //对应的JS文件正在加载
    FETCHING: 1,
    //加载完毕,并且已经分析了JS文件得到了一些相关信息
    SAVED: 2,
    //依赖的模块正在加载
    LOADING: 3,
    //依赖的模块都加载好了 ,处于可执行状态
    LOADED: 4,
    //正在执行这个模块
    EXECUTING: 5,
    //这个模块执行完成
    EXECUTED: 6
}



//根据url获取module
Module.get = function(url, deps){
    return cachedMods[url] || (cachedMods[url] = new Module(url,deps));
}



//进行ID到URL的转换,实际情况会比这个复杂的多,可以支付各种配置，各种映射
function idToUrl(id){
    return loadderDir + id + '.js';
}




//解析依赖的模块的实际地址集合
Module.prototype.resolve = function(){
    var mod = this;
    var ids = mod.dependencies;
    var uris = [];
    for(var i=0, len = ids.length; i<len; i++){
        uris[i] = idToUrl(ids[i]);
    }
    return uris;
}




Module.prototype.fetch = function(){
    var mod = this;
    var url = mod.url;

    mod.status = STATUS.FETCHING;
    request(url,onRequest)
    function saveModule(url,anonymousMeta){
        var mod = Module.get(url);
        if(mod.status < STATUS.SAVED){
            mod.id = anonymousMeta.id || url;
            mod.dependencies = anonymousMeta.deps || [];
            mod.factory = anonymousMeta.factory;
            mod.status = STATUS.SAVED;
        }
    }
    function onRequest(){
        //拿到之前define定义的信息
        if(anonymousMeta){
            saveModule(url,anonymousMeta)
            anonymousMeta = null;
        }
        //调用加载信息
        mod.load();
    }
}




Module.prototype.load = function(){
    var mod = this;

    if(mod.status >= STATUS.LOADING){
        return false;
    }

    var url = mod.resolve();

    mod.status = STATUS.LOADING;
    var len = mod._remain = url.length;
    var m;

    for(var i=0; i<len; i++){
        //拿到依赖模块对应的实例
        m = Module.get(url[i]);

        if(m.status < STATUS.LOADED){
            //把我注入到依赖的模块里,这边可能依赖多次,也就是在define里面多次调用require加载了同一个模块,所以要递增
            m._waitings[mod.url] = (m._waitings[mod.url] || 0) + 1;
        }else{
            mod._remain--;
        }
    }

    //如果发现已开始就没有依赖,或者早就加载好了 则直接调用自己的onload
    if(mod._remain === 0){
        mod.onload();
        return;
    }

    //检查依赖的模块,如果有还没加载的就调用他们的fetch让他们加载
    for(i=0; i<len ;i++){
        m = cachedMods[ url[i] ];

        if(m.status < STATUS.FETCHING){
            m.fetch();
        }else if(m.status === STATUS.SAVED){
            m.load();
        }
    }
}




Module.prototype.onload = function(){
    var mod = this;
    var status = STATUS.LOADED
    //预留接口给住函数use
    if(mod.callback){
        mod.callback();
    }

    var waitings = mod._waitings;
    var url ,m;
    //遍历依赖模块实例,挨个检查_remain 如果更新为0,就帮忙调用对应的onload
    for(url in waitings){
        if(waitings.hasOwnProperty(url)){
            m = cachedMods[url];
            //这里还有疑问
            m._remain -= waitings[url];
            if(m._remain === 0){
                m.onload();
            }
        }
    }
}




Module.prototype.exec = function(){
    var mod = this;

    if(mod.status >= STATUS.EXECUTING){
        return mod.exports;
    }

    mod.status = STATUS.EXECUTING;

    var url = mod.url;

    function require(id){
        return Module.get(idToUrl(id)).exec();
    }

    function isFunction(obj){
        return Object.prototype.toString.call(obj) === '[object Function]';
    }

    var factory = mod.factory;
    //如果factory是函数,直接执行获取到返回值,否则赋值,主要是为兼容define({数据这种写法}),可以用来发生jsonp这种情况等等
    var exports = isFunction(factory)?
        factory(require,mod.exports = {}, mod):
        factory;
    //如果没返回值,就使用mod.exports的值, 这里是否明白为什么要返回一个函数. 直接exports = function(){}不行
    if(exports === undefined){
        exports = mod.exports
    }
    mod.exports = exports;
    mod.status = STATUS.EXECUTED;
    return exports
}



var seajs = {};

seajs.use = function(ids,callback){
    var mod = Module.get('_user_secial_id',ids);
    //使用上面onload预留的接口
    mod.callback = function(){
        var exports = [];
        //拿到依赖的模块地址数组
        var url = mod.resolve();

        for(var i=0, len=url.length; i<len ;i++){
            exports[i] = cachedMods[url[i]].exec();
        }
        //注入回回调函数
        if(callback){
            callback.apply(window,exports);
        }
    }
    //使用load去挂载
    mod.load();
}




