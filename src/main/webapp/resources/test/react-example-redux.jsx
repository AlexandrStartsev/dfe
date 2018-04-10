const initialState = {
    name: "Mark",
    cart: [{key: 1, value: 'Instagram'}, {key: 2, value: 'WhatsApp'}, {key: 3, value: 'Oculus'}],
    key: 4
};
let rootReducer = (state = initialState, action) => {
    if(action.type == "ADD_ITEM")
        return {cart: state.cart.concat({key: state.key, value: action.payload}), key: state.key+1, name: state.name};
    if(action.type == "MODIFY_ITEM") {
        let newCart = state.cart.slice();
        newCart[action.payload.pos] = Object.assign({}, newCart[action.payload.pos], {value: action.payload.value});
        return { cart: newCart, key: state.key, name: state.name };
    }
    return state
}
let store = Redux.createStore(rootReducer);


class EditableRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            value: props.item.value,
            originalValue: props.item.value
        }
    }

    componentDidUpdate() {
        this.input && this.input.focus();
    }

    closeInput(store) {
        if(store) {
            this.props.setValue(this.state.value);
            this.setState({ edit: false, originalValue: this.state.value })
        } else {
            this.setState({ edit: false, value: this.state.originalValue })
        }
        this.input = null;
    }

    handleOnKeyDown(e) {
        e.key == 'Enter' && this.closeInput(true);
        e.key == 'Escape' && this.closeInput(false);
    }
    handleOnKeyUp(e) {
        if(e.key.toString().match(/^\w$/)) {
            this.setState({ value: this.input.value })
            this.props.setValue(this.state.value);
        }
    }

    render() {
        return( 
            <li onClick={e => this.setState({edit: true})}> { 
                this.state.edit ? <input 
                                      ref={e => this.input = e} 
                                      defaultValue={ this.state.value } 
                                      onChange={e => this.setState({value: e.target.value})}
                                      onBlur={ this.closeInput.bind(this, true) }  
                                      onKeyDown={e => this.handleOnKeyDown(e) }
                                      onKeyUp={e => this.handleOnKeyUp(e) }
                                  /> : this.state.value } 
            </li> )
    }
}

let mapStateToProps = (state, props) => ({ item: state.cart[props.index] });
let mapDispatchToProps = dispatch => ({setValue: i => value => dispatch({ type: "MODIFY_ITEM", payload: { pos: i, value: value } })});
let mergeProps = (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    setValue: dispatchProps.setValue(ownProps.index),
});

const EditableRowContainer = ReactRedux.connect(mapStateToProps, mapDispatchToProps, mergeProps)(EditableRow);

class ShoppingList extends React.Component {
    render() {
        return (
            <div className="shopping-list">
                <h1>Shopping List for {this.props.name}</h1>
                <ul>
                   <li>{this.props.cart[0].value}</li>
                   { 
                        this.props.cart.map((item, i) => {
                            
                            return React.createElement(EditableRowContainer, {index: i, key: item.key})
                        })
                   }
                </ul>
                <button onClick={() => this.props.addNewRecord('New record') }>Add new record</button>
            </div>
        );
    }
}

class App extends React.Component {
    render() {
        let mapStateToProps = state => ({ cart: state.cart, name: state.name })
        let mapDispatchToProps = dispatch => ({addNewRecord: item => dispatch({ type: "ADD_ITEM", payload: item })})
        return React.createElement( ReactRedux.connect(mapStateToProps, mapDispatchToProps)(ShoppingList) );
    }
}

const Provider = ReactRedux.Provider;

ReactDOM.render( 
    <Provider store={store}>
        <App />
    </Provider>, document.getElementById("react") );

/*const initialState = {
    name: "Mark",
    cart: [{key: 1, value: 'Instagram'}, {key: 2, value: 'WhatsApp'}, {key: 3, value: 'Oculus'}],
    key: 4
};
let rootReducer = (state = initialState, action) => {
    if(action.type == "ADD_ITEM")
        return {cart: state.cart.concat({key: state.key, value: action.payload}), key: state.key+1, name: state.name};
    if(action.type == "MODIFY_ITEM") {
        let newCart = state.cart.slice();
        newCart[action.payload.pos] = Object.assign({}, newCart[action.payload.pos], {value: action.payload.value});
        return { cart: newCart, key: state.key, name: state.name };
    }
    return state
}
let store = Redux.createStore(rootReducer);


class EditableRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            value: props.item.value,
            originalValue: props.item.value
        }
    }

    componentDidUpdate() {
        this.input && this.input.focus();
    }

    closeInput(store) {
        if(store) {
            this.props.setValue(this.state.value);
            this.setState({ edit: false, originalValue: this.state.value })
        } else {
            this.setState({ edit: false, value: this.state.originalValue })
        }
        this.input = null;
    }

    handleOnKeyDown(e) {
        e.key == 'Enter' && this.closeInput(true);
        e.key == 'Escape' && this.closeInput(false);
    }
    handleOnKeyUp(e) {
        if(e.key.toString().match(/^\w$/)) {
            this.setState({ value: this.input.value })
            this.props.setValue(this.state.value);
        }
    }

    render() {
        return( 
            <li onClick={e => this.setState({edit: true})}> { 
                this.state.edit ? <input 
                                      ref={e => this.input = e} 
                                      defaultValue={ this.state.value } 
                                      onChange={e => this.setState({value: e.target.value})}
                                      onBlur={ this.closeInput.bind(this, true) }  
                                      onKeyDown={e => this.handleOnKeyDown(e) }
                                      onKeyUp={e => this.handleOnKeyUp(e) }
                                  /> : this.state.value } 
            </li> )
    }
}

class ShoppingList extends React.Component {
    constructor(props) {
        super(props);
        this.connectedChildren = new Map();
    }
    connectChild(item) {
        if(!this.connectedChildren.has(item.key)) {
            let mapStateToProps = state => ({ item: state.filter(i => i.key == item.key) })
            let mapDispatchToProps = dispatch => ({setValue: value => dispatch({ type: "MODIFY_ITEM", payload: { key: item.key, value: value } })})
            this.connectedChildren.set(item.key, ReactRedux.connect(mapStateToProps, mapDispatchToProps)(EditableRow), {key: item.key})
        }
        return this.connectedChildren.get(item.key);
    }
    
    render() {
        return (
            <div className="shopping-list">
                <h1>Shopping List for {this.props.name}</h1>
                <ul>
                   <li>{this.props.cart[0].value}</li>
                   { this.props.cart.map(item => React.createElement(this.connectChild(item), {key: item.key})) }
                </ul>
                <button onClick={() => this.props.addNewRecord('New record') }>Add new record</button>
            </div>
        );
    }
}

class App extends React.Component {
    render() {
        let mapStateToProps = state => ({ cart: state.cart, name: state.name })
        let mapDispatchToProps = dispatch => ({addNewRecord: item => dispatch({ type: "ADD_ITEM", payload: item })})
        return React.createElement( ReactRedux.connect(mapStateToProps, mapDispatchToProps)(ShoppingList) );
    }
}

ReactDOM.render( 
    <Provider store={store}>
        <App />
    </Provider>, document.getElementById("react") );*/