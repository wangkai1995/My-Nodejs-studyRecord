import React ,{ Component,PropTypes } from 'react';
import {immutableRenderDecorator} from 'react-immutable-render-mixin';


import { Modal ,Calendar  } from 'antd';
import 'antd/dist/antd.css';


@immutableRenderDecorator
class ModalDate extends Component{
	static propTypes = {
		showDate: PropTypes.string,
		showWeek: PropTypes.string,
		isVisible: PropTypes.bool,
		onChange: PropTypes.func,
		onHide: PropTypes.func,
	};

	constructor(props){
		super(props);
		this.onDateChange = this.onDateChange.bind(this);
	}

	onDateChange(value) {
	  this.props.onChange(value);
	  this.props.onHide();
	}

	render(){
		const { onHide } = this.props;
		return (
			<Modal 	style={{ top: 30 }}
					title="请选择出发日期" 
					visible={this.props.isVisible}
					onCancel={onHide}
					onOk={onHide}
        	>
	          	<Calendar fullscreen={false} onSelect={this.onDateChange} />
	        </Modal>
		);
	}
}


export default ModalDate;