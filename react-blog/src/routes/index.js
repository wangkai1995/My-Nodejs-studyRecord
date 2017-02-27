import React from 'react';
import { Router, Route, IndexRoute, Redirect, hashHistory } from 'react-router';

import Frame from '../layouts/Frame';


import Home from '../views/home/Home';
import Detail from '../views/detail/Detail'; 


const routes = historys =>  (
	<Router history={historys}>
		<Route path='/' component={Frame} >
			<IndexRoute  component={ Home } />
			<Route path="/detail/:id" component={ Detail } />
		</Route>
		<Redirect from='*' to="/" />
	</Router>
);


export default routes;




