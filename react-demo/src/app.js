import React from 'react';
import ReactDom from 'react-dom';
import {Tabs ,TabNav ,TabContent,TabPane} from'./com/tab';

function Page(){
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
}


ReactDom.render(<Page/>,document.getElementById('app'));