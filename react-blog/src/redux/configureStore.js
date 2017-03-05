import { createStore ,combineReducers ,compose ,applyMiddleware} from 'redux';
import { hashHistory } from 'react-router';
import { routerReducer ,routerMiddleware } from 'react-router-redux';

import ThunkMiddleware from 'redux-thunk';
import fetchMiddleware from './fetchMiddleware';
import rootReducer from './reducers';
import DevTools from './DevTools';


//注意这！！ 如果不这样传递 那么会报错！！！
const router = routerMiddleware(hashHistory);

const finalCreateStore = compose(
	applyMiddleware(
		ThunkMiddleware,
		fetchMiddleware,
		router,
	),
	DevTools.instrument(),
)(createStore);



const reducer = combineReducers({
	...rootReducer,
	routing : routerReducer, 
});



export default function configureStore(initialState){

	const store = finalCreateStore(reducer, initialState);

	return store;
}



