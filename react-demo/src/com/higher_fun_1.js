import React,{Component} from 'react';
 

const MyContainer = (WrappedComponent) =>
	class extends Component{

		constructor(props){
			super(props);

			this.state = {
				name: '',
			};

			this.onNameChange = this.onNameChange.bind(this);

		}

		onNameChange(event){
			var val = event.target.value;

			this.setState({
				name: val,
			});
		}

		render(){
			const newProps = {
				name: {
					value:this.state.name,
					onChange: this.onNameChange,
				},
			};

			console.log(this.props);
			return (
				<WrappedComponent {...this.props} {...newProps} />
			);
		}
	}


class MyComponent extends Component{
	render(){
		console.log(this.props,11111);

		return (
			<div>
				<input type="text" name="name" {...this.props.name} />
				<p>{this.props.name.value}</p>
			</div>
		);
	}
}

export default MyContainer(MyComponent) ;
