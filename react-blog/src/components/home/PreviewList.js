import React ,{ Component ,PropTypes } from 'react';
import Preview from './Preview';


class PreviewList extends Component{
	static propTypes = {
		loading: PropTypes.bool,
		error: PropTypes.bool,
		loadArticles : PropTypes.func,
		articleList : PropTypes.arrayOf( PropTypes.object ),
	};
	
	componentDidMount(){
		this.props.loadArticle();
	}

	render(){
		const { loading, error, articleList ,push } = this.props;
		if(error){
			return <p className="message">出错了</p>
		}

		if(loading){
			return <p className="message">加载中</p>
		}
		
		//注意这里普通的函数map的元素 需要在作用域里面执行 并且外面要包裹父元素
		const list = articleList.map( item =>  { 
					return (
						<Preview {...item} key={item.id} push={push} ></Preview>
					);
				});
		//必须这样 不然无法执行 会报类型错误
		return (
			<div>
				{list}
			</div>
		);
	}

}


export default PreviewList;





