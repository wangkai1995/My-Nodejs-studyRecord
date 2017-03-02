import { combineReducers } from 'redux';
import tableReducer,{ table } from '../../components/detail/TableRedux';


//action 
export default combineReducers({
	tableReducer
});


export const actions = {
	table
};


