

function loadTableArticles(id){

	if(!id){
		var url = "http://localhost:3000/article";
	}else{
		var url = 'http://localhost:3000/article/'+id;
	}
	
 	return{
 		url: url,
 		type: ['LOAD_TABLE_ARTICLES', 'LOAD_TABLE_ARTICLES_SUCCESS' ,'LOAD_TABLE_ARTICLES_ERROR']
 	};
}


const initialState = {
	articles: [],
	query: '',
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
				articles: action.payload,
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
};


function changeQuery(e){
	var value = e.target.value.trim();
	return{
		type:'CHANGE_QUERY',
		payload:{
			query: value,
		},
	};
};


function search(){
	return (dispatch,getState) =>{		
		const { query } = getState().detail.tableReducer;
		return dispatch( loadTableArticles(query) );
	}
}



export { loadTableArticles , changeQuery , search };

export default tableReducer;