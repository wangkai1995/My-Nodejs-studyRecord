try{
	module.exports = Promise
}catch(e){}


//Proimse构造函数
function Promise(executor){
	//隔离this
	//但是注意这里
	//status暴露出来了
	//这个状态可以在外边被改变,还是需要处理
	var self = this;
	self.status = 0;  //当前状态
	self.data = undefined; //值
	self.onResolveCallback = []; //在触发resolve之前可能存在多个回调函数
	self.onRejectCallback = [];  //在触发reject之前可能存在多个回调函数


	//执行成功的函数
	function resolve(value){
		//判断是否是promise对象
		if(value instanceof Promise){
			return value.then(resolve)
		}
		//如果是等待状态
		//切换成异步调用
		setTimeout(function(){
			if(self.status === 0){
				self.status = 1;
				self.data = value;
				for(var i=0; i<self.onResolveCallback.length; i++){
					self.onResolveCallback[i](value);
				}
			}	
		},0);
		
	}

	//执行失败的函数
	function reject(value){
		//如果是等待状态
		setTimeout(function(){
			if(self.status === 0){
				self.status = -1;
				self.data = value;
				for(var i=0; i< self.onRejectCallback.length; i++){
					self.onRejectCallback[i](value);	
				}
			}
		},0);
	}

	//用于融合promise调用的规范返回
	//newPromise = 新返回的链试对象
	//result = 执行的结果
	function resultPromise(newPromise,result,resolve,reject){
		var then;
		var thenCalledOrThorw = false;  //是否已经执行flag  防止一个promise重复执行
		
		//如果新对象等于返回值
		if(newPromise === result){
			return reject(new TypeError('promise链接出现循环'));
		}

		if(result instanceof Promise){
			//result的状态如果还没确定
			//那么可能被thenable决定最终状态和值
			//可能是一个不正常的resolve
			if(result.status === 0){
				result.then(function(value){
					resultPromise(newPromise,value,resolve,reject);
				},reject);
			}else{
				//如果已经确定了 那么是个正常的promise
				result.then(resolve,reject);
			}
			return
		}

		//判断返回值的类型
		if( result !== null && (typeof result === 'object'|| typeof result === 'function') ){
			try{
				//因为result.then可能是获得的 所以多次读取可能产生副作用
				//既要判断他的类型 又要调用他就是2次读取
				then = result.then;
				//这里增加一个值的判断
				if(typeof then === 'function'){
					//这里谁先执行就以谁的结果为准
					then.call(result,function res(res_value){
						if(thenCalledOrThorw){return;}
						thenCalledOrThorw = true;
						return resultPromise(newPromise,res_value,resolve,reject);
					},function rej(rej_value){
						if(thenCalledOrThorw){return;}
						thenCalledOrThorw = true;
						return reject(rej_value);
					})
				}else{
					resolve(result);
				}

			}catch(err){
				if(thenCalledOrThorw){return}
				thenCalledOrThorw = true;
				return reject(err)
			}
			// end if
		}else{
			resolve(result);
		}
	}

	//考虑可能出错的错误捕获过程
	try{
		//执行executor
		executor(resolve,reject)
	}catch(err){
		reject(err);
	}
}


//在原型定义then方法
//@onResolve =成功回调
//@onReject =失败回调
Promise.prototype.then = function(onResolve,onReject){
	var self = this;
	var NewPromise;

	//根据标准传入的参数不是函数则定义成函数

	onResolve = typeof onResolve === 'function'? onResolve:function(result){return result};
	onReject = typeof onReject === 'function'? onReject:function(err){throw err};

	//then返回新的Proimse
	//未发生变化
	if(self.status === 0){
		//在这里由于还未确定状态所以将resolve和reject放入对应的on(Reject 'or' Resolve)Callback
		return NewPromise = new MyPromise(function(resolve,reject){
			//放入对应的回调队列
			//接受队列
			self.onResolveCallback.push(function(result){
				try{
					var res = onResolve(result);
					//使用当前状态返回当前值
					resultPromise(NewPromise,res,resolve,reject);
				}catch(err){
					//如果出错则使用错误值
					reject(err);
				}
			});
			

			//拒绝队列
			self.onRejectCallback.push(function(result){
				try{
					var rej = onReject(result);
					//使用当前状态返回当前值
					resultPromise(NewPromise,rej,resolve,reject);
				}catch(err){
					//如果出错则使用错误值
					reject(err);
				}
			});
		});
	}


	//已接受
	if(self.status === 1){
		return NewPromise  = new MyPromise(function(resolve, reject){
			//异步执行以下
			setTimeout(function(){
				//到这里函数已经执行 所以执行一下回调
				try{
					//如果回调返回的是MyPromise对象则直接使用这个对象
					var result = onResolve(self.data);
					//使用当前状态返回当前值
					resultPromise(NewPromise,result,resolve,reject);
				}catch(err){
					//如果出错则使用错误值
					reject(err);
				}
			},0);			
		});
	}

	//已拒绝
	if(self.status === -1){
		return Newpromise = new MyPromise(function(resovle,reject){
			//异步执行
			setTimeout(function(){
				//到这里函数已经拒绝 所以执行一下回调
				try{
					//如果回调返回的是MyPromise对象则直接使用这个对象
					var result = onReject(self.data);
					//使用当前状态返回当前值
					resultPromise(NewPromise,result,resolve,reject);
				}catch(err){
					//如果出错则使用错误值
					reject(err);
				}
			},0);
		});
	}
}


//在原型定义catch方法
//传入拒绝方法
Promise.prototype.catch = function(onReject){
	return this.then(null,onReject);
}


//返回异步对象
Promise.deferred = Promise.defer = function(){
	var df = {};
	df.promise = new Promise(function(resolve,reject){
		df.resolve = resolve;
		df.reject = reject;
	});

	return df;
}
 



/********************测试1*******************/
// var test = new MyPromise(function(resolve,reject){
// 	console.log('64654646');
// 	reject('promise test');
// });
// console.log('aaaaaa');
// test.then(function(value){
// 	console.log('value='+value);
// 	return value;
// },function(err){
// 	console.log('err='+err);
// 	return err;
// }).then(function(value2){
// 	console.log('value2'+value2)
// },function(err2){
// 	console.log('err2='+err2)
// })



















