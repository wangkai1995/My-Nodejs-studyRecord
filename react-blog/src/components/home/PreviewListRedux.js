

const initialState = {
	loading: true,
	error: false,
	articleList: [],
}

const LOAD_ARTICLE = 'LOAD_ARTICLE';
const LOAD_ARTICLE_SUCCESS = 'LOAD_ARTICLE_SUCCESS';
const LOAD_ARTICLE_ERROR = 'LOAD_ARTICLE_ERROR';


export function loadArticle() {
	return {
		type: [ LOAD_ARTICLE, LOAD_ARTICLE_SUCCESS, LOAD_ARTICLE_ERROR ],
		// url: '/api/articles.json', 
		url: 'http://localhost:3000/test',
	};
}




function previewList (state = initialState, action){
	
	switch(action.type){ 
		//load
		case LOAD_ARTICLE: {
			return {
				...state,
				loading: true,
				error: false,
			};
		}
		//success
		case LOAD_ARTICLE_SUCCESS: {
			return {
				...state,
				loading: false,
				error:false,
				articleList: action.payload.articleList,
			};
		}
		//error
		case LOAD_ARTICLE_ERROR:{
			return {
				...state,
				loading: false,
				error: true,
			};
		}	

		default : 
			return state;
	}
}


export default previewList ;


