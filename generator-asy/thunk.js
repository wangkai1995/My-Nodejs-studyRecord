//thunk es5 +es6 
//thunk函数 = 传入参数组成一个函数 返回在需要调用的函数中

//ES5
// function thunk(fn){
// 	return function(){
// 		//把传入参数变为数组
// 		var ags = Array.portotype.slice.call(argument);
// 		//返回一个带回调函数的函数
// 		return function(callback){
// 			ags.push(callback);
// 			//将回调函数放在数组最后
// 			//返回运行结果
// 			return fn.apply(this,ags);
// 		}	
// 	}
// }

// ES6
// function thunk(fn){
// 	//返回一个带参数数组的函数
// 	return function(...args){
// 		//返回一个带回调参数的函数
// 		return function(callback){
// 			//返回运行结果
// 			return fn.call(this,...args,callback)
// 		}
// 	}
// }

var fs = require('fs');

//thunkify模块
function thunkify(fn){
	return function(){
		var args = new Array(arguments.length);
		var self = this;
		for(var i=0; i<args.length; i++){
			args[i] = arguments[i];
		}

		return function(done){
			var flag = false;
			args.push(function(){
				//关键是这里 保证回调函数只运行一次
				if(flag){return;}
				flag = true;
				//回调函数在这里运行
				done.apply(null,arguments);
			})
			
			try{
				console.log(args);
				fn.apply(self,args);
			}catch(err){
				done(err);
			}
		}
	}
}

var readThunk = thunkify(fs.readFile);

function run(fn){
	var gen = fn;
	
	function next(err,data){
		if(err){return;}
		var result = gen.next(data);
		if(result.done){return;}
		console.log(result);
		result.value(next);
	}

	next();
}

function* readGen(){
	var r1 = yield readThunk('111.txt');
	console.log(r1.toString());
	var r2 = yield readThunk('222.txt');
	console.log(r2.toString());
}

var gen = readGen();
run(gen);

















