import React ,{ Component , PropTypes } from 'react';
import { Table } from 'antd';
import 'antd/dist/antd.css';

const columns = [{
	title: '标题',
	dataIndex: 'title',
},{
	title: '描述',
	dataIndex: 'desc',
},{
	title: '发布日期',
	dataIndex:'date',
}];



class ArticleTable extends Component{


	componentDidMount(){
		this.props.load();
	}


	render(){

		if(this.props.loading){
			return <p>加载中</p>
		}

		if(this.props.error){
			return <p>出错了!</p>
		}
		
		return(
			<div className="table">
				<div className="search">
					<input 
						type="text"
						placeholder="请输入关键字"
						value={this.props.query}
						onChange={this.props.changeQuery}
					/>
					<button onClick={this.props.search}>搜索</button>
				</div>
				<Table columns={columns} dataSource={this.props.articles.articleList} />
			</div>
		);
	};
}

export default ArticleTable;





