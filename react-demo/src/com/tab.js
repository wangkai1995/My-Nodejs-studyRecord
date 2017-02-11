import React,{Component , PropTypes ,CloneElement} from 'react';
import classnames from 'classnames';
 
// tabs
 class Tabs extends Component {
		static propTypes = {
			//主节点的class
			className : PropTypes.string,
			classPrefix : PropTypes.string,
			children: PropTypes.oneOfType([
				PropTypes.arrayOf(PropTypes.node),
				PropTypes.node,
			]),
			//默认激活的节点 组件外更新
			defaultActiveIndex: PropTypes.number,
			//主动激活的节点 组件内更新
			activeIndex: PropTypes.number,
			//切换的回调函数
			onChange:PropTypes.func,
		};
		
		//设置默认的Props
		static defaultProps = {
			ClassPrefix : 'tabs',
			onChange: () => {},
		};

		//构造函数初始化
		constructor(props){
			//执行下父节点构造函数
			super(props);
			//对事件方法绑定作用域
			this.handLeTabClick = this.handLeTabClick.bind(this);
			
			//赋值给常量初始化
			const currProps = this.props;
			
			let activeIndex;
			//初始化index 
			if('activeIndex' in currProps){
				activeIndex = currProps.activeIndex;
			}else if('defaultActiveIndex' in currProps){
				activeIndex = currProps.defaultActiveIndex;
			}
			
			//初始化状态
			this.state = {
				activeIndex,
				prevIndex : activeIndex,
			}
		}

		//父节点传入准备更新事件
		componentWillReceiveProps(nextProps){
			//如果父节点外部传入props activeIndex 则直接更新
			if('activeIndex' in nextProps){
				this.setState({
					activeIndex : nextProps.activeIndex
				});
			}
		}

		//点击事件
		handLeTabClick(activeIndex){
			const prevIndex = this.state.activeIndex;

			//传入的index 和当前的不一样 并且存在默认defaultActiveIndex 的时候更新
			if(activeIndex !== prevIndex && 'defaultActiveIndex' in this.props){
				this.setState({
					activeIndex,
					prevIndex,
				});
				//触发切换回调
				this.props.onChange(activeIndex,prevIndex);
			}
		}

		//生成TabNav
		renderTabNav(){
			const {classPrefix , children} = this.props;

			return(
				<TabNav
					key='tabBar'
					classPrefix={classPrefix}
					onTabClick = {this.handLeTabClick}
					panels={children}
					activeIndex={this.props.activeIndex}
				>
				</TabNav>
			)
		}

		//生成TabContent
		renderTabContent(){
			const {classPrefix ,children} = this.props;

			//children = <TabPane key={2} tab={'tab 3'}>第三个tab里的内容</TabPane> 列表,

			return(
				<TabContent
					key="tabcontent"
					classPrefix={classPrefix}
					panels={children}
					activeIndex={this.props.activeIndex}
				>
				</TabContent>
			)
		}

		//真正生成
		render(){
			const { className } = this.props;
			//classnames 合并class
			const classes = classnames(className,'ui-tabs');

			return(
				<div className={classes}>
					{this.renderTabNav()}
					{this.renderTabContent()}
				</div>
			)
		}
 }


 //tabNav
 class TabNav extends Component{
 	static propTypes = {
 		classPrefix: PropTypes.string,
 		panels: PropTypes.node,
 		activeIndex:PropTypes.number,
 	};

 	getTabs(){
 		const {panels, classPrefix, activeIndex} = this.props;
		
		//循环生成nav
 		return React.Children.map(panels, (child) =>{
			
			if(!child){
				return;
			}
			console.log(this.props);

			//编号
			const order = parseInt(child.key, 10);

			child.props.disabled = child.props.disabled ? child.props.disabled  : false
			//利用class来显示隐藏
			let classes = classnames({
				[`${classPrefix}-tab`] : true,
				[`${classPrefix}-active`] : activeIndex === order,
				[`${classPrefix}-disabled`] : child.props.disabled ,
			});

			let events = {};
			if(! child.props.disabled ){
				events = {
					onClick: this.props.onTabClick.bind(this,order),
				};
			}
			
			const ref = {};
			if(activeIndex === order){
				ref.ref = 'acitveTab';
			}

			return(
				<li
					role='tab'
					aria-disabled = {child.props.disabled? 'true' : 'false'}
					aria-selected = {activeIndex === order? 'true' : 'false'}
					{...events}
					className={classes}
					key={order}
					{...ref}
				>
					{child.props.tab}
				</li>
			)
 		});
 	}

 	render(){
 		const {classPrefix} = this.props;

 		const rootClasses = classnames({
 			[`${classPrefix}-bar`]: true,
 		});

 		const classes = classnames({
 			[`${classPrefix}-nav`]: true,
 		});

 		return(
 			<div className={rootClasses} role="tablist">
 				<ul className={classes}>
 					{this.getTabs()}
 				</ul>
 			</div>
 		);
 	}
 }


 //tabContent
 class TabContent extends Component{
 	static propTypes = {
		classPrefix : PropTypes.string,
		panels: PropTypes.node,
		activeIndex: PropTypes.number,
		isActive: PropTypes.bool,
 	};

 	getTabPanes(){
 		const {classPrefix , activeIndex ,panels,isActive} =this.props;

 		return React.Children.map(panels, (child) =>{
			if(!child){
				return ;
			}

			const order = parseInt(child.key ,10);
			const isActive = activeIndex === order;
			
			//这里实际复制的是tabPanel
			//panels = <TabPane key={2} tab={'tab 3'}>第三个tab里的内容</TabPane>列表
			return React.cloneElement(child,{
				classPrefix,
				isActive,
				children: child.props.children,
				key:`tabpane-${order}`,
			});
 		});
 	}

 	render(){
		const {classPrefix} = this.props;

		const classes = classnames({
				[`${classPrefix}-content`]: true,
		});

		return(
			<div className={classes}>
				{this.getTabPanes()}
			</div>
		)
	}

 }


//tanPane
 class TabPane extends Component{
	static propTypes = {
			tab:PropTypes.oneOfType([
				PropTypes.string,
				PropTypes.node,
			]).isRequired,
			order:PropTypes.string.isRequired,
			disabled:PropTypes.bool,
			isActive:PropTypes.bool,
	};

 	render(){
 		const {classPrefix , className , isActive , children} = this.props;
 		const classes = classnames({
 			[className] : className,
 			[`${classPrefix}-panel`]: true,
 			[`${classPrefix}-active`]: isActive,
 		});

 		return (
 			<div
 				role='tabpanel'
 				className = {classes}
 				aria-hidden = {!isActive}
 			>
 				{children}
 			</div>
 		)
 	}
}

//导出
export {Tabs,TabNav,TabContent,TabPane}











