
const fetchMiddleware = store => next => action =>{

	if(!action.url || !Array.isArray(action.type)){
		return next(action);
	}

	const [ LOADING , SUCCESS ,ERROR ] = action.type;

	next({
		type : LOADING,
		loading : true,
		// ...action,
	});

	fetch( action.url , 
			{ 	method:action.method? action.method: 'GET',
		 		params: action.params ? action.params : null
 			}
 		)
		.then( result =>{
			result.json().then( data =>{
				next({
					type : SUCCESS,
					loading : false,
					payload : data,
				});
			}); // END JSON()
		})
		.catch( err =>{
			next({
				type : ERROR,
				loading : false,
				error: err,
			});
		});

}



export default fetchMiddleware;