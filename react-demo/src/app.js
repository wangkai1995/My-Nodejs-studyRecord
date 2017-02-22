import React, {Component} from 'react';
import ReactDom from 'react-dom';
//DMOE 1
// import {Tabs ,TabNav ,TabContent,TabPane} from'./com/tab';
//DMOE 2
import {ImgTest} from './com/eventDemo1';
//DMOE 3
import {From} from './com/from';
//DMOE 7
import MyComponent from './com/higher_fun_1';
//DMOE 4
import {InputQuery} from './com/higher_fun_2';
//DMOE 5
import {Tabs ,TabNav ,TabContent,TabPane} from'./com/tab_optimize';

//router test
import {Router ,Route , IndexRoute, Redirect ,Link ,hashHistory ,browserHistory} from 'react-router';

//redex demo1
import ReduxDemo from './com/redux_1';

//redex middleware test
import { createStore , applyMiddleware } from 'redux';
// import thunkMiddleware from './com/redux_middleware';

import aaa from './com/redux_2';



//test
function Page(){

	return <div>测试</div>

	/************DEMO 1**********/
	// let tabChange = function(now,perv){
	// 	// console.log(now,perv);
	// 	// myMiddleware();
	// }
	// return(
	// 	<Tabs classPrefix={'tabs'} defaultActiveIndex = {0} className='tabs-bar'
	// 		onChange={ tabChange }
	// 		children={[
	// 			<TabPane key={0} order={0}  tab={'tab 1'} >第一个tab里的内容</TabPane>,
	// 			<TabPane key={1} order={1}  tab={'tab 2'} >第二个tab里的内容</TabPane>,
	// 			<TabPane key={2} order={2}  tab={'tab 3'} >第三个tab里的内容</TabPane>,
	// 		]}
	// 	>
	// 	</Tabs>
	// );
	

	// let tabChange = function(now,perv){
	// 	console.log(now,perv);
	// }
	// return(
	// 	<Tabs classPrefix={'tabs'} defaultActiveIndex = {0} className='tabs-bar'
	// 		onChange={tabChange}
	// 		children={[
	// 			<TabPane key={0} tab={'tab 1'}>第一个tab里的内容</TabPane>,
	// 			<TabPane key={1} tab={'tab 2'}>第二个tab里的内容</TabPane>,
	// 			<TabPane key={2} tab={'tab 3'}>第三个tab里的内容</TabPane>,
	// 		]}
	// 	>
	// 	</Tabs>
	// );



	/*******DEMO 2**********/
	// return (
	// 	<ImgTest/>
	// );


	/*********DEMO 3**********/
	// return (
	// 	<From></From>
	// )
	

	// return (
	// 	<InputQuery></InputQuery>
	// )

	
	/******* DEMO4*********/
	// return (
	// 	<ReduxDemo/>
	// )
}

ReactDom.render(<Page/>,document.getElementById('app'));






/***************** 关于 redux 中间件的部分      **********************/

// function testMiddleware(){
// 	return next => action =>{
// 		console.log(action,new Date().getTime(),5555 );

// 		if( !action.url && !Array.isArray(action.types) ){
// 			return next(action);
// 		}
// 	}
// }

// function thunkMiddleware({ dispatch, getState }) {
//     return next => action =>{
//     	console.log(action,new Date().getTime() );
//     	typeof action === 'function' ?
//       	action(dispatch, getState) :
//       	next(action);
//     }
// }

// function getTest(dispatch,getState){
// 	 console.log('dwaasdawcc',new Date().getTime() );
// 	 dispatch({type:'ADD_TEST',payload:88});
// 	 console.log('aaaaaaaa',new Date().getTime() );
// }


// const testTimeMiddleware = store => next => action =>{
// 	if( !action.url && !Array.isArray(action.types) ){
// 		return next(action);
// 	}

// 	next({
// 		type:'TEST-LOAD',
// 		load: true,
// 		...action,
// 	});

// 	setTimeout(function(){
// 		next({
// 			type:'TEST-SUCCESS',
// 			load: false,
// 			payload: '测试成功',
// 		});
// 	},2000);


// }


//执行一下
// function myMiddleware(){

// 	var testCreateStroe = applyMiddleware(
// 			testTimeMiddleware,
// 			testMiddleware,
// 		)(createStore);

//     var store = testCreateStroe((state = 0 , action) =>{

//     		console.log(action,'5565644');

//             switch(action.type){
//                 case 'ADD_COUNT' :
//                     return state + action.payload;
//                 case 'REDUCE_COUNT' :
//                     return state - action.payload;
//                 default :
//                     return state;
//             }
//         });


//    	store.dispatch( {url:'ceshi',types:['aaaa','vvvvv']} );

// }

// myMiddleware();





/******************************* 关于 react - router 的部分********************************************/

// class war extends Component{
// 	constructor(props){
// 		super(props);
// 	}

// 	render(){

// 		console.log(this.props);
// 		//使用getComponent 父节点要用对应的props命名

// 		return(
// 			<div>
// 				<h1>测试111111111</h1>
// 				{this.props.children || this.props.From || this.props.ImgTest }
// 			</div>
// 		)
// 	}
// }


// const From = (location,callback) =>{
// 	require.ensure([], (require)=>{
// 		callback(null,require('./com/from'))
// 	},'From');
// }

// //如果获取的是对象形式 必须通过包裹父节点的{this.props.children || this.props.From || this.props.ImgTest }形式
// const ImgTest = (location,callback) =>{
// 	require.ensure([],(require)=>{
// 		callback(null,require('./com/eventDemo1'))
// 	},'ImgTest')
// }

// //如果直接输出<Route path='test' getComponent={MyContainer} />等没有父节点包裹必须要通过高阶组件返回成函数执行
// const MyContainer = (location,callback) =>{
// 	require.ensure([],(require)=>{
// 		callback(null,require('./com/higher_fun_1').default)
// 	},'MyContainer')
// }


// ReactDom.render((
// 	<Router history={hashHistory}>
// 		<Route path='/' component={war}/>
// 		<Route path='demo' getComponent={From} />
// 		<Route path='test' getComponent={MyContainer} />
// 	</Router>
// ),document.getElementById('app'));


