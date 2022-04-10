class LabelMultipleSelect extends React.Component {

    constructor(props) {
        super(props);
        this.onChangeOption = this.onChangeOption.bind(this);
        this.getOptionItems = this.getOptionItems.bind(this);
        this.setDisable = this.setDisable.bind(this);
        this.setDisplay = this.setDisplay.bind(this);
        this.unsetSelect = this.unsetSelect.bind(this);

        this.getSelectedOptionValues = this.getSelectedOptionValues.bind(this);
        this.__ref_select = React.createRef();
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

    unsetSelect(){
        this.__ref_select.current.selectedIndex = -1;
    }

    setDisplay(option){
        this.__ref_select.current.style.display = option ? '' : 'none';
    }

    render(){
        let option_items = this.getOptionItems(this.props.options);
        let class_label_col_size = this.props.label_col_class == undefined ? 'col-md-3' : this.props.label_col_class;
        let class_select_col_size = this.props.select_col_class == undefined ? 'col-md-9' : this.props.select_col_class;

        return(
            <div className="row">
                <label className={class_label_col_size + " col-form-label font-weight-bold task-edit-modal-option-label"}>{this.props.label}</label>
                <div className={class_select_col_size}>
                    <select className="form-select form-multiple-select modal-select" ref={this.__ref_select} aria-label="multiple select example" onChange={this.onChangeOption.bind(this)} multiple>
                        {option_items}
                    </select>
                </div>
            </div>
        );
    }
}