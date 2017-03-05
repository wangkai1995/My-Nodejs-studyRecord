import React, { Component,PropTypes } from 'react';
import { Modal } from 'antd';
import { createForm } from 'redux-form-utils';
import formConfig from './Modal.config.js';



@createForm(formConfig)
class ArticleModal extends Component {
	render(){
		const { title ,desc , date } = this.props.fields;

		return(
			<Modal
				visible = {this.props.isVisible}
				onCancel = {this.props.hideModal}
				onOk = {this.props.addArticle}
			>
				<div className="form">
						<div className="control-group">
							<label>标题</label>
							<input type="text" {...title} />
						</div>
						<div className="control-group">
							<label>描述</label>
							<textarea {...desc}  />
						</div>
						<div className="control-group">
							<label>发布日期</label>
							<input type="date" {...date} />
						</div>
				</div>
			</Modal>
		)	
	};
}



export default ArticleModal;





