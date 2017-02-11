import React,{Component} from 'react';


class From extends Component{

	render(){
		return (
			<div className='from-demo-wap'>
				<InputText></InputText>
				<InputCheckBox></InputCheckBox>
				<InputRadio></InputRadio>
				<FromSelect></FromSelect>
			</div>
		)
	}

}


//输入框
class InputText extends Component{
	
	//constructor  构造函数
	constructor(props){
		super(props);

		this.state = {
			inputValue: '',
			textValue: '',
		};
	}

	handleInput(e){
		this.setState({
			inputValue: e.target.value,
		});
	}

	handleText(e){
		this.setState({
			textValue: e.target.value,
		});
	}

	render(){
		return (
			<div className="test-from-demo-1">
				<input type='text' onChange={ (e)=>{this.handleInput(e)} } />
				<p>input输入的内容: {this.state.inputValue}</p>
				<textarea onChange={ (e)=>{this.handleText(e)} } />
				<p>text输入的内容: {this.state.textValue}</p>
			</div>
		)
	}
}


//选择框
class InputCheckBox extends Component{
	constructor(props){
		super(props);

		this.state = {
			chenckValue : ''
		};
	}

	handleCheck(e){
		this.setState({
			chenckValue : e.target.value,
		});
	}

	render(){
		return(
			<div className='chenck-test'>
				<input type='checkBox'
					   value='Box1' 
					   checked={ this.state.chenckValue === 'Box1'} 
					   onChange={ e =>{this.handleCheck(e) }} 
			    />
				<input type='checkBox' 
					   value='Box2' 
					   checked={ this.state.chenckValue === 'Box2'}  
					   onChange={ e =>{this.handleCheck(e) }} 
				/>
			</div>
		)
	}
}

//复选框
class InputRadio extends Component{
	constructor(props){
		super(props);

		this.state = {
			radio : [],
		};

	}

	handleRadio(e){
		var {radio} = this.state;
		var check = e.target.value;

		if(radio.indexOf(check) === -1){
			radio.push(check);
		}else{
			radio = radio.filter( (val) => { return val !== check });
		}

		this.setState({
			radio: radio,
		});
	}

	render(){
		return(
			<div className="radio-test">
				<input  type="radio"
						value="radio_1"
						onChange={ (e) =>{this.handleRadio(e) }}
						checked ={this.state.radio.indexOf('radio_1') !== -1} 
				/>
				<input  type="radio"
						value="radio_2"
						onChange={ (e) =>{this.handleRadio(e) }}
						checked ={this.state.radio.indexOf('radio_2') !== -1} 
				/>
				<input  type="radio"
						value="radio_3"
						onChange={ (e) =>{this.handleRadio(e) }}
						checked ={this.state.radio.indexOf('radio_3') !== -1} 
				/>
				<input  type="radio"
						value="radio_4"
						onChange={ (e) =>{this.handleRadio(e) }}
						checked ={this.state.radio.indexOf('radio_4') !== -1} 
				/>
			</div>

		)
	};
}


//select
class FromSelect extends Component{
	
	constructor(props){
		super(props);

		this.handleSelectTypeChange = this.handleSelectTypeChange.bind(this);

		this.state = {
			//选择模式
			multiple : false,
			//选中值
			selectValue : '',
		};
	}
	
	//切换单选和多选模式
	handleSelectTypeChange(){
		 var val;
		 //如果不是数组
		 console.log(this.state.selectValue);
		
		if(this.state.selectValue){
			 if(!Array.isArray(this.state.selectValue) ){
				val = [];
				val.push(this.state.selectValue);
			 }else{
			 	//变成单选内容选中为数组第一个
				val = this.state.selectValue.shift();
			 }
		}else{
			val = [];
		}

		 this.setState({
		 	multiple: !this.state.multiple,
		 	selectValue: val,
		 })
	}

	//选中
	handleSelect(e){
		var val = e.target.value;
		var value = this.state.selectValue
		if( Array.isArray(value) ){
			//如果是多选
			if( value.indexOf(val) === -1 ){
				value.push(val);
			}else{
				value = value.filter( item => item!== val);
			}
		}else{
			//如果是单选
			value = val;
		}

		this.setState({
			selectValue : value,
		});
	}

	render(){
		return(
			<div className="test-select">
				<button onClick={this.handleSelectTypeChange} className="ChangeType">
					{this.state.multiple? '切换成单选' : '切换成多选' }
				</button>
				<select multiple={this.state.multiple} value={this.state.selectValue} className="select-demo" onChange={ (e) => {this.handleSelect(e)} } >
					<option value="beijing">北京</option>
					<option value="shanghai">上海</option>
					<option value="guangzhou">广州</option>
					<option value="shenzhen">深圳</option>
				</select>
			</div>
		)

	}
}





export {From};