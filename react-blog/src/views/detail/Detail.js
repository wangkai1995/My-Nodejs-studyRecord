import React,{ Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ArticleTable from '../../components/detail/Table';
import ArticleModal from '../../components/detail/Modal';
import { tableActions , modalActions } from './DetailRedux';


class Detail extends Component {
	render(){
		return(
			<div class="page">
				<button onClick={this.props.modalActions.showModal}>新增文章</button>
				<ArticleTable {...this.props.table} {...this.props.tableActions} />
				<ArticleModal {...this.props.modal} {...this.props.modalActions} />
			</div>
		);
	}
}



export default connect( state => {
	return {
		table: state.detail.tableReducer,
		modal: state.detail.modalReducer,
	};
},dispatch => {
	const { changeQuery,search,loadTableArticles } = tableActions;
	const { addArticle ,showModal ,hideModal } = modalActions;
	return {
		tableActions: {
			load:bindActionCreators(loadTableArticles ,dispatch),
			search : bindActionCreators(search , dispatch),
			changeQuery:bindActionCreators( changeQuery,dispatch)
		},
		modalActions:{
			addArticle: bindActionCreators(addArticle , dispatch),
			showModal: bindActionCreators(showModal , dispatch),
			hideModal: bindActionCreators(hideModal , dispatch)
		}
	};
})(Detail);