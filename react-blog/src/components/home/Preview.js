import React,{ Component ,PropTypes } from 'react';
import './Preview.css';


class Preview extends Component{
	static propTypes = {
		title: PropTypes.string,
		date: PropTypes.string,
		description: PropTypes.string,
		push: PropTypes.func,
	};

	handleNavigate(e,id){
		e.preventDefault();
		this.props.push(id);
	}

	render(){
		const { title ,date ,description, id } = this.props;
		return (
			<article className="article-preview-item">
				<h1 className='title'> 
					<a  href={`/detail/${id}`} 
						onClick={this.handleNavigate.bind(this,id)}
					>
						{title} 
					</a>
				</h1>
				<span className="date"> {date} </span>
				<p className='desc'> {description} </p>
			</article>
		);
	}
}


export default Preview;

