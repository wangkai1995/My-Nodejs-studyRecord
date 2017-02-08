//获取slice函数
var slice = Array.prototype.slice;

// co模块实现
function co(gen){
	//保存内部指针
	var self = this;
	//提取第二个参数
	var args = slice.call(arguments,1);  // = [].from(arguments).slice(1);

	//把传入的参数使用promise封装
	return new Promise(resolve,reject){
		//执行以下generator函数
		if(typeof gen === 'function'){ gen = gen.apply(self,args);}
		//如果传入不是generator函数 走错误流程
		if(!gen || typeof gen.next !== 'function' ){ reject(gen); }
		//初始化执行第一次
		onResolve();
		
		//执行成功调用函数
		function onResolve(res){
			var ret;
			try{
				//初次调用res为空
				ret = gen.next(res);
			}catch(err){
				 reject(err);
			}
			//继续循环调用
			next(ret);
		}

		// 执行失败调用函数
		function onReject(rej){
			var ret;
			try{
				//向内抛出错误
				ret = gen.throw(rej);
			}catch(err){
				reject(err);
			}
			next(ret);
		}

		//向下循环
		function next(ret){
			//如果执行完
			if(ret.done){resolve(ret.value);}
			//这里将yield后面的函数转化为promise
			var value =  toPromise.call(self,ret.value);
			//确定一下是否是Promise
			if(value && isPromise){
				//依靠then开始循环
				value.then(onResolve,onReject);
			}else{
				reject(new TypeError('错误的类型'+value));
			}
		}

		//转化promise
		function toPromise(obj){
			//不存在直接返回
			if(!obj){
				return obj;
			}
			//如果是Promise直接返回
			if(isPromise(obj)){
				return obj;
			}
			//如果是generator则递归调用co
			if(isGeneratorFunction(obj) || isGenerator(obj)){
				return co.call(this,obj);
			}
			//如果是个thunk函数则转换成promise 注意这里可能出错
			if(typeof obj === 'function'){
				return thunkToPromise(obj);
			}
			//如果是数组 调用数组转化方法 注意这里数组里面只能是promise
			if(Array.isArray(obj)){
				return arrayToPromise(obj);
			}
			//如果是对象
			if(isObject(obj)){
				return objectToPromise(obj);
			}
			//都不是比如字符串和数值什么的 直接返回走reject
			return obj;
		}

		//将thunk包装成promise 注意这里的thunk回调是按照node.js的callback方式 只传入(err,res)等参数
		function thunkToPromise(fn){
			var _this = this;
			return new Promise(function(resolve,reject){
				//执行一下fn
				//注意这里默认传入的是node.js形式的回调函数
				fn.call(_this,function(err,res){
					if(err){reject(err);}
					//如果回调函数有多余参数
					//则取第二个
					if(arguments.length > 2){
						res = slice.call(arguments,1);
					}
					resolve(res);
				});
			});
		}
		
		//array转promise 调用的promise.all方法，将promise数组统一遍历递归转换成一个promise执行
		function arrayToPromise(array){
			return Promise.all(array.map(ToPromise,this));	
		}

		//将obj转换成promise 也需要类似数组的遍历一遍，统一封装成一个整体promise
		function objToPromise(obj){
			//构造一个空的类型对象
			var result = new obj.constructor();
			var keyList= Object.key(obj);
			var promiseList = [];
			//开始遍历
			for(var i=0; i<key.length;i++){
				var key = keyList[i];
				//这里递归遍历obj的属性
				var promise = toPromise.call(this,obj[key]);
				//如果属性返回值是一个promise
				if(promise && isPromise(promise)){
					//加入all中
					defer(promise,key);
				}else{
					//如果不是 其他值则直接赋值过去
					result[key] = obj[key];
				}
			}
			//遍历成功结束返回
			return Promise.all(promiseList).then(function(){
				return result;
			})

			//将对象的promise执行返回result中
			function defer(pro,key){
				//先占位
				result[key] = undefined;
				//传入promise执行结果
				//如果失败则为undefined 外面的all也不会执行
				promiseList.push(pro.then(function(res){
					result[key] = res;
				}))
			}
		}

		//判断是否是promise 简单的判断then
		function isPromise(obj){
			return typeof obj.then === 'function';
		}

		//判断是否是generator生成对象就判断next throw是不是函数
		function isGenerator(obj){
			return typeof obj.next === 'function' && typeof obj.throw === 'function';
		}

		//判断是否是generatorFunction就判断构造函数名
		function isGeneratorFunction(obj){
			var constructors = obj.constructor;
			//小技巧防止object.create(null)
			if(!constructors){return false;}
			//这里两种情况，一种是名字正确，一种是他的prototype是generator
			if('GeneratorFunction' === constructors.name ||
				'GeneratorFunction' === constructors.displayName ){
				return true;
			}
			return isGenerator(constructors.prototype);
		}
		
		//判断对象就简单的通过构造函数了
		function isObject(val){
			return Object === val.constructor;
		}

	}
	
}























