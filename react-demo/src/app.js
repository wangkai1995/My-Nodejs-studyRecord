import React from 'react';
import ReactDom from 'react-dom';

function Page(){
	const test = ['react','hello word','2017.2.1'];
	
	

	return(
		<div>
			<h1>测试一个React</h1>
			<ul>
				{test.map(item => (<li>{item}</li>))}		
			</ul>
		</div>
	);
}


ReactDom.render(<Page/>,document.getElementById('app'));