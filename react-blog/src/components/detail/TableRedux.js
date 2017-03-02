

function loadTableArticles(){
 	return{
 		url: 'http://localhost:3000/test',
 		types: ['LOAD_TABLE_ARTICLES', 'LOAD_TABLE_ARTICLES_SUCCESS' ,'LOAD_TABLE_ARTICLES_ERROR']
 	};
}


const initialState = {
	table: [],
	loading: true,
	error: false
};


function tableReducer(state = initialState, action){
	switch(action.type){

		case 'CHANGE_QUERY':{
			return{
				...state,
				query:action.payload.query
			};
		}

		case 'LOAD_TABLE_ARTICLES':{
			return{
				...state,
				loading:true,
				error:false
			};
		}

		case 'LOAD_TABLE_ARTICLES_SUCCESS':{
			return{
				...state,
				loading:false,
				table: action.payload,
				error:false
			};
		}

		case 'LOAD_TABLE_ARTICLES_ERROR':{
			return{
				...state,
				loading:false,
				error:true
			};
		}

		default:
			return state;
	}
}


export loadTableArticles;

export default tableReducer;