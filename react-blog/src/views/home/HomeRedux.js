import { combineReducers } from 'redux';
import list, {loadArticle} from '../../components/home/PreviewListRedux';



//action
export default combineReducers({
	list,
});


//reducer
export const actions = {
  	loadArticle,
};




