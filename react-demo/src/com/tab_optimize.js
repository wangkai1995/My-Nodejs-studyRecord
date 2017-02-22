import React ,{Component , PropTypes ,cloneElement } from 'react';
import ReactDom from 'react-dom';
import EventEmitter from 'events';
import classnames from 'classnames';
import CSSModules from 'react-css-modules';
import {Seq} from 'immutable';
import {immutableRenderDecorator} from 'react-immutable-render-mixin';
import {Motion ,spring} from 'react-motion';
import styles from './../style/tab.scss';



@immutableRenderDecorator
@CSSModules(styles,{allowMultiple : true})
class TabPane extends Component{
	static propTypes = {
		tab : PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.node,
		]).isRequired,
		order:PropTypes.string.isRequired,
		disabled:PropTypes.bool,
		isActive:PropTypes.bool,
	};

	render(){
		const {ClassName , isActive ,children} = this.props;

		const classes = classnames({
			panel: true,
			contentActive : isActive,
		});

		return (
			<div
				role='tabPane'
				styleName={classes}
				aria-hidden = {!isActive}
			>
				{children}
			</div>
		);
	}
}



@immutableRenderDecorator
@CSSModules(styles,{allowMultiple : true})
class TabContent extends Component{
	static propTypes = {
		panels : PropTypes.object,
		activeIndex : PropTypes.number,
		isActive : PropTypes.bool,
	};

	getTabPanes(){
		const {activeIndex ,panels ,isActive} = this.props;
		//这里的child是immutable转换的 需要用自己的方法
		return panels.map( (child) => {
			if(!child){
				return ;
			}

			const order = parseInt(child.props.order,10);
			const isActive = activeIndex === order;

			return React.cloneElement(child,{
				isActive,
				children: child.props.children,
				key: `tabpane-${order},`
			});
		});
	}

	render(){
		const classes = classnames({
			content:true,
		});

		return(
			<div styleName={classes}>
				{this.getTabPanes()}
			</div>
		);
	}
}


//获取元素宽度
function getOuterWidth(el){
	return el.offsetWidth;
}

//获取元素位置的顶部距离和左边距离
function getOffset(el){
	const html = el.ownerDocument.documentElement;
	//获取元素位置 这个方法在safari下不支持 
	//另外需要注意 这个属性不计算父节点的padding 和margin
	const box = el.getBoundingClientRect();
	//offsetLeft 获取或设置相对于 具有定位属性(position定义为relative)的父对象 的左边距
	//这里要看情况使用！！！

	// return{
	// 	top: box.top +window.pageYOffset - html.clientTop,
	// 	left: box.left+window.pageXOffset - html.clientLeft
	// }
	return {
		left: el.offsetLeft,
		top: box.top +window.pageYOffset - html.clientTop,
	}
}


@immutableRenderDecorator
@CSSModules(styles,{allowMultiple: true})
class TabNav extends Component{
	static propTypes = {
		panels: PropTypes.object,
		activeIndex: PropTypes.number,
	};

	constructor(props){
		super(props);

		this.state = {
			inkBarWidth: 0,
			inkBarLeft : 0,
		};
	}
	
	//渲染完成
	componentDidMount(){
		//计算激活tab的宽度和相对屏幕左边的位置
		const {activeIndex} = this.props;
		const node = ReactDom.findDOMNode(this);
		const el = node.querySelectorAll('li')[activeIndex];

		// console.log(node.querySelectorAll('li'));
		
		this.setState({
			inkBarWidth : getOuterWidth(el),
			inkBarLeft : getOffset(el).left,
		});
	}
	
	//更新之后
	componentDidUpdate(prevProps){
		if(prevProps.activeIndex !== this.props.activeIndex){
			const {activeIndex} = this.props;
			const node = ReactDom.findDOMNode(this);
			const el = node.querySelectorAll('li')[activeIndex];

			this.setState({
				inkBarWidth : getOuterWidth(el),
				inkBarLeft: getOffset(el).left,
			});
		}
	}

	getTabs(){
		const {panels,activeIndex} = this.props;

		//这里的childer是immutable转换的 需要用自己的方法
		return panels.map( (child) =>{
			if(!child){
				return ;
			}

			const order = parseInt(child.props.order,10);
			let classes = classnames({
				tab: true,
				tabActive: activeIndex === order,
				disabled: child.props.disabled,
			});

			let events = {};
			if(!child.props.disabled){
				events = {
					onClick: this.props.onTabClick.bind(this,order),
				};
			}

			const ref = {};
			if(activeIndex === order){
				ref.ref = 'activeTab';
			}

			return(
				<li
					role='tab'
					aria-disabled = {child.props.disabled? 'true':'false'}
					aria-selected = {activeIndex === order? 'true':'false'}
					{...events}
					styleName={classes}
					key={order}
					{...ref}
				>
					{child.props.tab}
				</li>
			);

		});
	}

	render(){
		const {activeIndex} = this.props;

		const rootClasses = classnames({
			bar: true,
		});

		const classes = classnames({
			nav: true,
		});
		//利用Motion执行动画
		return(
			<div styleName={rootClasses} role="tablist">
				<Motion style={ {left: spring(this.state.inkBarLeft)} }>
					{ ({left}) => <InkBar width={this.state.inkBarWidth} left={left} />  }
				</Motion>
				<ul styleName={classes}>
					{this.getTabs()}
				</ul>
			</div>	
		);
	}

}

@immutableRenderDecorator
@CSSModules(styles,{allowMultiple:true})
class InkBar extends Component{
	 static propTypes = {
	 	left: PropTypes.number,
	 	width: PropTypes.number,
	 };

	 render(){
	 	const {left ,width} = this.props;

	 	const classes = classnames({
	 		inkBar : true,
	 	});

	 	return(
	 		<div styleName={classes} style = {{
				WebkitTransfrom : `translate3d(${left}px,0,0)`,
				transform: `translate3d(${left}px,0,0)`,
				width: width,
	 		}}>
	 		</div>
	 	)
	 }
}


@immutableRenderDecorator
@CSSModules(styles,{allowMultiple: true})
class Tabs extends Component{
	static propTypes = {
		children : PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node,
		]),
		defaultActiveIndex: PropTypes.number,
		activeIndex :PropTypes.number,
		onChange: PropTypes.func,
	};


	static defaultProps = {
		onChange : () => {},
	};

	constructor(props){
		super(props);
		
		const currProps = this.props;

		this.handleTabClick = this.handleTabClick.bind(this);
		this.immChildren = Seq(currProps.children);
		
		let activeIndex;

		if('activeIndex' in currProps){
			activeIndex = currProps.activeIndex;
		}else if('defaultActiveIndex' in currProps){
			activeIndex = currProps.defaultActiveIndex;
		}

		this.state = {
			activeIndex,
			prevIndex : activeIndex,
		};
	}
	
	//如果是父节点更新 传下来的props
	componentWillReceiveProps(nextProps){
		if('activeIndex' in nextProps){
			this.setState({
				activeIndex : nextProps.activeIndex,
			});
		}
	}

	handleTabClick(activeIndex){
		const prevIndex = this.state.activeIndex;

		if(prevIndex !== activeIndex &&
		  'defaultActiveIndex' in this.props){
			
			this.setState({
				activeIndex,
				prevIndex,
			});

			this.props.onChange({activeIndex,prevIndex});
		}
	}

	renderTabNav(){
		return(
			<TabNav
				key='tabBar'
				onTabClick={this.handleTabClick}
				panels={this.immChildren}
				activeIndex={this.state.activeIndex}
			/>
		);
	}

	renderTabContent(){
		return(
			<TabContent
				key='tabcontent'
				activeIndex={this.state.activeIndex}
				panels={this.immChildren}
			/>
		);
	}

	render(){
		const {className} = this.props;
		const classes = classnames(className,'ui-tab');

		return(
			<div className={classes}>
				{this.renderTabNav()}
				{this.renderTabContent()}
			</div>
		);
	}

}

export {Tabs ,TabNav ,TabContent ,TabPane};
