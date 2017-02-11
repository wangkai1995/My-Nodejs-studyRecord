import React ,{ Component } from 'react';


class ImgTest extends Component{
	
	constructor(props){
		super(props);

		this.handleClick = this.handleClick.bind(this);
		this.handleClickQR = this.handleClickQr.bind(this);

		this.state = {
			active : false,
		}
	}
	
	
	//避免react事件和原生事件混合使用
	componentDidMount(){
		document.body.addEventListener('click',(e)=>{
			// 方式一
			if(e.target && e.target === document.querySelector('.qr-test')){
				return false;
			}

			this.setState({
				active:false,
			});
		});

		//方式二
		// document.querySelector('.qr-test').addEventListener('click',(e)=>{
		// 	e.stopPropagation();

		// })
	}

	//防止内存泄漏
	componentWillUnmount(){
		document.body.removeEventListener('click');
		// document.querySelector('.qr-test').removeEventListener('click');
	}

	
	handleClick(e){
		e.preventDefault();
		this.setState({
			active : !this.state.active,
		});
	}

	handleClickQr(e){
		//这里无效 阻止不了
		e.stopPropagation();
		e.preventDefault();
	}

	render(){
		return (
			<div className="test-qr">
				<button className="button" onClick={this.handleClick}>二维码</button>
				<div className='code'
					 style={{ display: this.state.active? 'block': 'none'}}
					 onClick={this.handleClickQR}
				>
				<img className="qr-test" src="http://www.meinvtupian.com/upimages/attached/image/20161104/20161104180435_39479.jpg" alt="qr"/>
				</div>
			</div>
		)
	}

};


export { ImgTest };