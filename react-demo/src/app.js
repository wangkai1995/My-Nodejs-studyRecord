import React from 'react';
import ReactDom from 'react-dom';
//DMOE 1
// import {Tabs ,TabNav ,TabContent,TabPane} from'./com/tab';
//DMOE 2
import {ImgTest} from './com/eventDemo1';
//DMOE 3
import {From} from './com/from';
//DMOE 4
import {InputQuery} from './com/higher_fun_2';
//DMOE 5
import {Tabs ,TabNav ,TabContent,TabPane} from'./com/tab_optimize';


 
function Page(){
	/************DEMO 1**********/
	let tabChange = function(now,perv){
		console.log(now,perv);
	}
	return(
		<Tabs classPrefix={'tabs'} defaultActiveIndex = {0} className='tabs-bar'
			onChange={ tabChange }
			children={[
				<TabPane key={0} order={0}  tab={'tab 1'} >第一个tab里的内容</TabPane>,
				<TabPane key={1} order={1}  tab={'tab 2'} >第二个tab里的内容</TabPane>,
				<TabPane key={2} order={2}  tab={'tab 3'} >第三个tab里的内容</TabPane>,
			]}
		>
		</Tabs>
	);
	


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

}




ReactDom.render(<Page/>,document.getElementById('app'));