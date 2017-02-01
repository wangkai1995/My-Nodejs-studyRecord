//解构
// var obj = {
// 	test:[
// 		{k:'wangkai'},
// 		{l:"caihong"}
// 	]
// };
// var {test:[{k},{l}]} = obj;
// console.log(k,l);


//默认值
// let obj={},
// 	test = [];
// ( {age :obj.age, name:test[0] } = { age:17 ,name:'caihong'} );
// console.log(obj,test);



//函数的默认解构
// function test({student:{name,age}} = {}){
// 	console.log('student:'+name+'age'+age);
// }
// test({student:{name:'wangkai',age:21}});



//字符串扩展
//includes 方法确定字符串是否在字符串内 
// let test = 'wangkai ai huangcaihong';
// console.log( test.includes('ai') );


//模板字符串
// let name = 'wangkai';
// let age = 21;
// console.log(
// 	`测试ES6字符串模板
// 	姓名：${name}
// 	年龄：${age}
// 	`
// );
//trim()方法清除收尾字符串


//模板可以嵌套 模板也可以执行函数
// function test(){
// 	return '执行的函数';
// }
// console.log(`ES6模板执行函数:${test()}`);


//引用模板本身
//方式一
// let returns = 'return'+'`template:${name}`';
// let test = new Function('name',returns);
// console.log(test('wangkai'));
//方式二
// let fn  = '(name) => `templace:${name}`';
// let test = eval.call(null,fn);
// console.log( test('wangkai') );

