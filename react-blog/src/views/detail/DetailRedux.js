import { combineReducers } from 'redux';
import tableReducer from '../../components/detail/TableRedux';
import modalReducer from '../../components/detail/ModalRedux';



//action 
export default combineReducers({
	tableReducer,
	modalReducer,
});


export * as tableActions from '../../components/detail/TableRedux';

export * as modalActions from '../../components/detail/ModalRedux';


