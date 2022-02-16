class LabelMultipleSelectDual extends React.Component {

    constructor(props) {
        super(props);
        this.onChangeOption = this.onChangeOption.bind(this);
        this.getOptionItems = this.getOptionItems.bind(this);
        this.setDisable = this.setDisable.bind(this);
        this.onToggle = this.onToggle.bind(this);

        this.state = {
            toggle : false
        }

        this.getSelectedOptionValues = this.getSelectedOptionValues.bind(this);
        this.__ref_select = React.createRef();
    }

    onToggle(){
        this.setState(prevState => ({
            toggle : !prevState.toggle,
        }));
    }

    getToggleValue(){
        return this.state.toggle;
    }

    getOptionItems(items){
        
        const keys = [...Object.keys(items)];
        let idx = 0;

        return items.map((item) => 
            <option
                className="select-option"
                key={keys[idx++]}
                value={item}
            >
            {item}
            </option>
        );
    }

    onChangeOption(e){
        const values = this.getSelectedOptionValues();
        if(this.props.h_on_change != undefined) this.props.h_on_change(values);
    }

    getSelectedOptionValues(){
        const options = this.__ref_select.current.children;
        const selected_values = [];

        for(var i = 0; i < options.length; i++){
            if(options[i].selected) selected_values.push(options[i].value);
        }
        
        return selected_values;
    }

    setDisable(option){
        this.__ref_select.current.disabled = option;
    }

    render(){
        let option_items = this.getOptionItems(this.props.data[this.state.toggle ? 1 : 0].options);
        let class_label_col_size = this.props.label_col_class == undefined ? 'col-md-3' : this.props.label_col_class;
        let class_select_col_size = this.props.select_col_class == undefined ? 'col-md-9' : this.props.select_col_class;

        return(
            <div className="row">
                <label 
                    onClick={this.onToggle.bind(this)} 
                    style={{"cursor": "pointer", "color" : "#dc3545 !important"}}
                    className={this.props.data[this.state.toggle ? 1 : 0].class + " " + class_label_col_size}
                > 
                    {this.props.data[this.state.toggle ? 1 : 0].label}
                </label>
                <div className={class_select_col_size}>
                    <select className="form-select form-multiple-select modal-select" ref={this.__ref_select} aria-label="multiple select example" onChange={this.onChangeOption.bind(this)} multiple>
                        {option_items}
                    </select>
                </div>
            </div>
        );
    }
}