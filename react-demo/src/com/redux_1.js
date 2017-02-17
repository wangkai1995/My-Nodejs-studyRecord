import {createStore} from 'redux';
import React,{Component} from 'react';

class Count extends Component{
    constructor(props){
        super(props);

        this.store = createStore( (state = 0 , action) =>{
            switch(action.type){
                case 'ADD_COUNT' :
                    return state + action.payload;
                case 'REDUCE_COUNT' :
                    return state - action.payload;
                default :
                    return state;
            }
        })

        this.state = {
            value: this.store.getState(),
        };

        
    }

    handleAdd(){
        var action = {
            type: 'ADD_COUNT',
            payload: 1,
        };

        this.store.dispatch(action);

        this.setState({
            value : this.store.getState(),
        })
    }

    handleReduce(){
        var action = {
            type: 'REDUCE_COUNT',
            payload: 1,
        };

        this.store.dispatch(action);

        this.setState({
            value: this.store.getState(),
        })
    }

    render(){
        var {value} = this.state;
        return(
            <div>
                <p>{value}</p>
                <button onClick={ ()=>{this.handleAdd()} }>加</button>
                <button onClick={ ()=>{this.handleReduce()} }>减</button>
            </div>
        )
    }
}

const ReduxDemo  = (WrappedComponent) =>
    class extends Component{
        constructor(props){
            super(props);
        }

        render(){
            return <WrappedComponent {...this.props} />
        }
    }


export default ReduxDemo(Count);