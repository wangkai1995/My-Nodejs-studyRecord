import React,{Component ,PropTypes } from 'react';
import {compose} from 'react-compose';
import classnames from 'classnames';

 
// 输入框
//@props.classPrefix = 最外层样式前缀
//@props.queryValue = 输入input值
//@props.queryDisabled = 查询按钮是否可用
//@props.BtnName = 按钮命名
//@props.onInputChange = 输入查询内容变化回调
//@props.onQueryClick =  点击查询回调
class SelectInput extends Component{
	//类型检查
	static propTypes = {
		queryValue: PropTypes.string,
		queryDisabled: PropTypes.bool,
		btnName: PropTypes.string,
		onInputChange: PropTypes.func,
		onQueryClick: PropTypes.func,
	};

	static defaultProps = {
		queryValue: '',
		queryDisabled: false,
		btnName: '查询',
		classPrefix: 'select',
		onInputChange : ()=>{},
		onQueryClick : ()=>{},
	};

	constructor(props){
		super(props);		
		this.state ={
			inputValue : this.props.queryValue,
			queryDisabled : this.props.queryDisabled,
			btnName: this.props.btnName,
		};		
	}

	//输入改变
	handleChange(event){
		let val = event.target.value;

		this.setState({
			inputValue: val,
		});

		this.props.onInputChange(val);
	}

	handleClick(event){

		this.props.onQueryClick(this.state.inputValue);
	}

	render(){
		const classes = classnames({
			[`${this.props.classPrefix}-select-input`]: true,
		
		});

		return(
			<div className={classes} el-name='select-input'>
				<input
					type="text"
					onChange={ (e) => { this.handleChange(e) } }
				/>
				<button 
					disabled={this.state.queryDisabled}
					onClick={ (e) => { this.handleClick(e) } }
				>
					{this.state.btnName}
				</button>
			</div>
		)
	}
}


//下拉list
//@props.classPrefix = 最外层样式
//@props.isActive = 是否激活
//@props.listData = 内容数组
//@props.onListClick = 点击内容回调
class SelectList extends Component{
	static propTypes = {
		classPrefix: PropTypes.string,
		listData : PropTypes.array.isRequired,
		isActive: PropTypes.bool.isRequired,
		onListClick: PropTypes.func,
	};

	static defaultProps = {
		classPrefix:'sleect-list',
		onListClick: ()=>{},
	};

	getItem(){
		return React.Children.map(this.props.listData,(item) =>{
			return (
				<li  onClick={  this.handleItemClick.bind(this,item)  }>
					{item}
				</li>
			)
		});
	}

	handleItemClick(item){
		this.props.onListClick(item);
	}

	render(){
		const classes = classnames({
			[`${this.props.classPrefix}-select-list`] : true,
			[`${this.props.classPrefix}-list-disabled`] : this.props.isActive,
		});


		return (
			<div className={classes} style={{ display: this.props.isActive? 'block': 'none'}} >
				<ul>
					{this.getItem()}
				</ul>
			</div>
		)
	}
}


//简单的测试
class InputQuery extends Component{

	constructor(props){
		super(props);

		this.state={
			listActive : false,
			listData:[],
			btnDisabled: false,
			value: '',
		}

		this.handleQuery = this.handleQuery.bind(this);
		this.handleInput = this.handleInput.bind(this);
		this.handleItem = this.handleItem.bind(this);
	}
	
	//渲染开始的时候请求加载数据 一般用于Ajax或者计算元素位置
	componentDidMount(){
		var test = [];
		for(let i=0; i<8 ;i++){
			test.push('测试数据:'+i);
		}

		this.setState({
			listData : test,
		});
	}
	
	//点击查询按钮
	handleQuery(val){
		console.log('点击了查询按钮查询的值是:',val);
	}

	//输入参数
	handleInput(val){
		console.log('输入的参数是:'+val);
		if(val){
			this.setState({
				btnDisabled : true,
				listActive : true,
			})
		}else{
			this.setState({
				btnDisabled : false,
				listActive : false,
			})
		}
	}

	//选择下拉框
	handleItem(val){
		console.log('下拉框的值:'+val);
		this.setState({
			listActive : false,
		});
	}

	render(){

		var inputProps = {
			classPrefix : 'select-input',
			queryValue: this.state.valu,
			queryDisabled: this.state.btnDisabled,
			BtnName: '查询',
			onInputChange: this.handleInput,
			onQueryClick: this.handleQuery,
		};

		var listProps = {
			classPrefix : 'select-list',
			isActive : this.state.listActive,
			listData : this.state.listData,
			onListClick : this.handleItem,
		};

		return(
			<div>
				<SelectInput {...inputProps} > </SelectInput>
				<SelectList {...listProps} > </SelectList>
			</div>
		)
		
	}
}		




export {InputQuery};








