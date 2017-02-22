import {createStore , applyMiddleware} from 'redux';


const getCity = ({dispatch,getState}) => next => action =>{
	 if(!action.url && !Array.isArray(action.types)){
	 	return next(action);
	 }

	 const [ success , error ,load] = action.types;
	
	 dispatch({
	 	type: load,
	 	load: true,
	 });


	fetch(action.url, {
      	headers : { 
        	'Content-Type': 'application/json',
        	'Accept': 'application/json'
       }
    }).then( result =>{
		result.json().then( data=>{
			console.log(data);
			dispatch({
				type:success,
				load: false,
				payload:JSON.stringify( data ),
			})
		});
	}).catch( err =>{
		dispatch({
			type:error,
			load: false,
			payload:err
		})
	});

}


function test(){
	var fetchCreateStore = applyMiddleware(
		   getCity,
		)(createStore);

	var fetchStore = fetchCreateStore( (state = 0,action) =>{
 			switch(action.type){
 				case 'RES_LOADER':
 					return console.log('load状态');
 				case 'RES_SUCCESS':
 					return console.log('成功!获得的数据是'+action.payload);
 				case 'RES_ERROR':
 					return console.log('失败!错误内容是'+action.payload);
 				default :
 					return state;
 			}
	});

	setTimeout(function(){
		fetchStore.dispatch({
			//依靠json-server
			url:'http://localhost:3000/list',
			types:['RES_SUCCESS','RES_ERROR','RES_LOADER'],
		})
	},1000);
}


test();

var aaa = '1523';

export default aaa;