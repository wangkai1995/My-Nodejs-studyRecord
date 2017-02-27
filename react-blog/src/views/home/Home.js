import React,{ Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PreviewList from '../../components/home/PreviewList';
import { actions } from './HomeRedux' ;

class Home extends Component {

	render(){
		const { list , listActions} = this.props;

		return(
			<div>
				<h1>Home</h1>
				<PreviewList
					{...list}
					{...listActions}
				/>
			</div>
		);
	}
}



export default connect( state => {
	return {
		list : state.home.list,
	};
},dispatch => {
	return {
		listActions : bindActionCreators(actions , dispatch),
	};
})(Home);




