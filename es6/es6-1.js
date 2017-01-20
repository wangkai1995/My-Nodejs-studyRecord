
//es6 Number.isFinite 方法表示数值是否有限
//es6 Number.isNaN 方法验证NaN
//isNaN()方法的ES5实现
// (function(global){
//     var global_isNaN = golbal.isNaN;

//     object.defineProperty(Number,'isNaN',{
//         value:function isNaN(value){
//             return typeof value === 'number' && global_isNaN(value);
//         },
//         configurable:true,
//         enumerable:false,
//         writable:true
//     });

// })(this)


//parseInt() => Number.parseInt
//parseFloat => Number.parseFloat

// ()=>...  ES6的简便函数方式

// es6 浮点数误差计算常量 Number.EPSILON

//关于Math 对象的扩展
//
//Math.trunc()去除一个数的小数部分 返回整数
//
// ES6 模仿
// Math.trunc = Math.trunc || function(number){
//     return number < 0? Math.ceil(number) : Math.floor(number);
// }

// 计算立方根
// Math.cbrt()
// 返回所有参数的平方和的平方根
// Math.hypot()

// 数组的扩展
// Array.from() = Array.prototype.slice.call(xxxx);
// 解构模式的(...list) = arguments 也有类似的功能  解析模式无法遍历无遍历器接口的数据  
// Array.from() 只要有length属性 就可以遍历
// Array.of() 将输入数值变成数组
// Array.find()返回回调函数为True的 成员
// Array.find(function(item){
//   return item==xxx? item:xxx
//})
// Array.findIndex() 类似 但是返回的是下标
// Array.fill(data,start,count) //用data填充数组数据 start=开始位置 count=数次
// Array.includes() 类似字符串的方法 返回数组是否包含某个值


















