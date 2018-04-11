class EditableRow extends Dfe.Component {
    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            originalValue: this.get(this.props.field)
        }
    }
    componentDidUpdate() {
        this.input && this.input.focus();
    }

    closeInput(store) {
        if(store) {
            this.set(this.props.field, this.input.value);
            this.setState({ edit: false, originalValue: this.input.value })
        } else {
            this.set(this.props.field, this.state.originalValue);
            this.setState({ edit: false })
        }
    }

    handleOnKeyDown(e) {
        e.key == 'Enter' && this.closeInput(true);
        e.key == 'Escape' && this.closeInput(false);
    }

    render() {
        return (
            <span> 
               { this.state.edit ? <input 
                                      ref={e => this.input = e} 
                                      defaultValue={ this.state.originalValue } 
                                      onChange={e => this.set(this.props.field, e.target.value)}
                                      onBlur={ this.closeInput.bind(this, true) }  
                                      onKeyDown={e => this.handleOnKeyDown(e) }
                                  /> :  
                <span onClick={e => this.setState({edit: true})}>{this.get(this.props.field)}</span>
                }{ this.errorMessage() }
            </span>
        )
    } 
    
    validate() {
        return this.get(this.props.field) == 0 && 'error';
    }
}

class ShoppingList extends Dfe.Component {
    render() {
        let rows = this.get('.cart');
        return (
            <div>
                <h1> Shopping List for {this.get('.name')} </h1>
                <h4> Reference value: {rows[0].get('.value')} </h4>
                <ul>
                    { 
                        rows.map(item => 
                            <li key={item.data.key}>
                                <EditableRow {...item} field={'.value'}/>
                                { rows.length > 1 && <button onClick={() => item.detach()}>Delete</button> }
                            </li> 
                        ) 
                    }  
                </ul>
                <button onClick={() => this.append('.cart', {value: 'Yes I want some !new face!'}) }>Add new record</button>
            </div>
        );
    }
}

class TabHeader extends Dfe.Component {
    render() {
        return ( <span style={{border: '1px solid #555', padding: '5px', borderRadius: '3px', margin: '2px'}} onClick={this.props.tabChange}>
                    <span>{this.get(this.props.caption)}</span>
                    { this.errorMessage() }
                 </span> )
    }
}

class Attendance extends Dfe.Component {
    constructor(props){
        super(props);
        this.state = {
            activeTab: 0
        }
    }
    render() {
        let people = this.get('people');
        return (
            <div>
                <div>
                    { people.map((niceGuy,i) => <TabHeader {...niceGuy} caption=".name" errorwatch="true" tabChange={() => this.setState({activeTab: i})}/>) }
                </div>
                <div>
                    { people.map(niceGuy => <ShoppingList {...niceGuy}/>).filter((niceGuy, i) => i == this.state.activeTab ) }
                </div>
            </div>
        );
    }
}

ReactDOM.render( <Attendance {...new Dfe.Proxy({people: [
                {name: 'Mark', cart: [{value: 'Instagram'}, {value: 'WhatsApp'}, {value: 'Oculus'}]}, 
                {name: 'Jake', cart: [{value: 'Facebook'}, {value: 'Youtube'}, {value: ''}] }]}) }/>, document.getElementById('react') );