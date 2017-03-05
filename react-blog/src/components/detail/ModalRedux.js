import formConfig from './Modal.config.js';
import { bindRedux } from 'redux-form-utils';

const {state:formState ,reducer : formReducer} = bindRedux( formConfig );


const initialState = {
	...formState,
	isVisible: false,
	loading:false,
	success:false,
	error:false,
}

function showModal(){
	return{
		type: 'SHOW-MODAL',
	};
}

function hideModal(){
	return{
		type: 'HIDE-MPDAL',
	};
}

function addArticle(){
	return ( dispatch, getState) =>{
		const { title, desc ,date } = getState().detail.modalReducer.form;

		return dispatch({
			url: 'http://localhost:3000/article',
			method: 'POST',
			params:{
				title:title.value,
				desc: desc.value,
				date: date.value,
			},
			type:['REQUEST-LOAD' , 'REQUEST-SUCCESS', 'REQUEST-ERROR']
		});
	};
}



function modal(state = initialState , action){

	switch(action.type){

		case 'SHOW-MODAL':
			return{
				...state,
				isVisible: true,
			};

		case 'HIDE-MPDAL':
			return{
				...state,
				isVisible: false,
			};

		case 'REQUEST-LOAD':
			return{
				...state,
				loading:true,
				success:false,
				error:false,
			};

		case 'REQUEST-SUCCESS':
			return{
				...state,
				loading:false,
				success: action.payload,
				error:false,
			};

		case 'REQUEST-ERROR':
			return{
				...state,
				loading:false,
				success:false,
				error:true,
			};

		default:
			return formReducer(state,action);
	};
}


export { addArticle, showModal, hideModal};
export default modal;



