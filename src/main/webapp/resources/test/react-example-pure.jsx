class EditableRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            value: props.value,
            originalValue: props.value
        }
    }

    componentDidUpdate() {
        this.input && this.input.focus(); //, document.elementFromPoint(this.state.x, this.state.y).click());
    }

    closeInput(store) {
        if(store) {
            this.props.setValue(this.state.value);
            this.setState({ edit: false, originalValue: this.state.value })
        } else {
            this.setState({ edit: false, value: this.state.originalValue })
        }
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
    }

    render() {
        console.log('ShoppingList::render');
        let rows = this.props.cart.map(record => <EditableRow 
                                                key={record.key} 
                                                value={record.value} 
                                                setValue={newValue => this.props.onRecordChange(record, 'value', newValue) }
                                            />);
        return (
            <div className="shopping-list">
                <h1 >Shopping List for {this.props.name}</h1>
                <ul>
                    <li>{this.props.cart[0].value}</li>
                    {rows}
                </ul>
                <button onClick={() => this.props.addNewRecord('New record') }>Add new record</button>
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cart: [{key: 1, value: 'Instagram'}, {key: 2, value: 'WhatsApp'}, {key: 3, value: 'Oculus'}],
            key: 4
        }
    }
    addNewRecord(name) {
        this.setState({cart: this.state.cart.concat({key: this.state.key, value: 'New record'}), key: this.state.key + 1 });
    }
    changeRecord(record, property, newValue) {
        let upd = this.state.cart.slice();
        upd.filter(rec => rec == record).pop()[property] = newValue;
        this.setState({cart: upd});
    }
    render() {
        return (
            <ShoppingList name="Mark" cart={this.state.cart} 
                addNewRecord={n => this.addNewRecord(n)}
                onRecordChange={ (record, property, value) => this.changeRecord(record, property, value) }/>
        )
    }
}

ReactDOM.render( <App/>, document.getElementById('react') );