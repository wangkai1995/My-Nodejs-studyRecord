import React,{ Component ,PropTypes } from 'react';
import './Preview.css';


class Preview extends Component{
	static propTypes = {
		title: PropTypes.string,
		date: PropTypes.string,
		description: PropTypes.string,
	};

	render(){
		const { title ,date ,description } = this.props;
		return (
			<article className="article-preview-item">
				<h1 className='title'> {title} </h1>
				<span className="date"> {date} </span>
				<p className='desc'> {description} </p>
			</article>
		);
	}
}


export default Preview;

