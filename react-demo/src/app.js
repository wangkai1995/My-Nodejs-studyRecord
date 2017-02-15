import React, {Component} from 'react';
import ReactDom from 'react-dom';
//DMOE 1
import {Tabs ,TabNav ,TabContent,TabPane} from'./com/tab';
//DMOE 2
import {ImgTest} from './com/eventDemo1';
//DMOE 3
import {From} from './com/from';
//DMOE 7
import MyComponent from './com/higher_fun_1';
//DMOE 4
import {InputQuery} from './com/higher_fun_2';

//router test
import {Router ,Route , IndexRoute, Redirect ,Link ,hashHistory} from 'react-router';

//test
// function Page(){
// 	/************DEMO 1**********/
// 	// let tabChange = function(now,perv){
// 	// 	console.log(now,perv);
// 	// }
// 	// return(
// 	// 	<Tabs classPrefix={'tabs'} defaultActiveIndex = {0} className='tabs-bar'
// 	// 		onChange={tabChange}
// 	// 		children={[
// 	// 			<TabPane key={0} tab={'tab 1'}>第一个tab里的内容</TabPane>,
// 	// 			<TabPane key={1} tab={'tab 2'}>第二个tab里的内容</TabPane>,
// 	// 			<TabPane key={2} tab={'tab 3'}>第三个tab里的内容</TabPane>,
// 	// 		]}
// 	// 	>
// 	// 	</Tabs>
// 	// );


// 	/*******DEMO 2**********/
// 	// return (
// 	// 	<ImgTest/>
// 	// );


// 	/*********DEMO 3**********/
// 	// return (
// 	// 	<From></From>
// 	// )
	
// 	/******* DEMO4*********/
// 	// return (
// 	// 	<InputQuery></InputQuery>
// 	// )
// }

// ReactDom.render(<Page/>,document.getElementById('app'));


const tab = function(){
	let tabChange = function(now,perv){
		console.log(now,perv);
	}
	return(
		<Tabs classPrefix={'tabs'} defaultActiveIndex = {0} className='tabs-bar'
			onChange={tabChange}
			children={[
				<TabPane key={0} tab={'tab 1'}>第一个tab里的内容</TabPane>,
				<TabPane key={1} tab={'tab 2'}>第二个tab里的内容</TabPane>,
				<TabPane key={2} tab={'tab 3'}>第三个tab里的内容</TabPane>,
			]}
		>
		</Tabs>
	);
};


class war extends Component{
	constructor(props){
		super(props);
	}

	render(){
		return(
			<div>
				<h1>测试111111111</h1>
				{this.props.children}
			</div>
		)
	}
}



ReactDom.render((
	<Router history={hashHistory}>
		<Route path='/' component={war}>
			<Route path='/demo' component={From} />
			<Route path='/test' component={tab} />
		</Route>
	</Router>
),document.getElementById('app'));


