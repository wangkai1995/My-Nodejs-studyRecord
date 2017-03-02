import { createStore ,combineReducers ,compose ,applyMiddleware} from 'redux';
import { HashHistory } from 'react-router';
import { routerReducer ,routerMiddleware } from 'react-router-redux';

import ThunkMiddleware from 'redux-thunk';
import fetchMiddleware from './fetchMiddleware';
import rootReducer from './reducers';
import DevTools from './DevTools';



const finalCreateStore = compose(
	applyMiddleware(
		ThunkMiddleware,
		fetchMiddleware,
		routerMiddleware(HashHistory),
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



