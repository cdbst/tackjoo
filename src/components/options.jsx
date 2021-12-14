class Options extends React.Component {

    constructor(props) {
        super(props);
        this.onChangeOption = this.onChangeOption.bind(this);
        this.getOptionItems = this.getOptionItems.bind(this);
        this.setDisable = this.setDisable.bind(this);

        this.getSelectedOptionValue = this.getSelectedOptionValue.bind(this);
        this.getSelectedOptionKey = this.getSelectedOptionKey.bind(this);


        this.ref_options = React.createRef();
    }

    getOptionItems(items, keys = undefined){
        
        if(keys == undefined) keys = [...Object.keys(items)];

        let idx = 0;

        return items.map((item) => 
            <option
                className="modal-select-option"
                key={keys[idx]}
                value={item}
                data-key={keys[idx++]}
            >
            {item}
            </option>
        );
    }

    onChangeOption(e){

        const selected_idx = e.target.options.selectedIndex;
        const selected_key = e.target.options[selected_idx].getAttribute('data-key');
        
        let data_to_pass = this.props.option_keys == undefined ? e.target.value : selected_key;

        if(this.props.h_on_change != undefined) this.props.h_on_change(data_to_pass);
    }

    getSelectedOptionKey(){

        if(this.props.option_keys == undefined) return undefined;

        let selected_idx = this.ref_options.current.selectedIndex;
        return this.props.option_keys[selected_idx];
    }

    getSelectedOptionValue(){
        return this.ref_options.current.value;
    }

    setDisable(option){
        this.ref_options.current.disabled = option;
    }

    render(){
        let option_items = this.getOptionItems(this.props.options, this.props.option_keys);

        return(
            <div className="row">
                <label className="col-md-3 col-form-label font-weight-bold task-edit-modal-option-label">{this.props.label}</label>
                <div className="col-md-9">
                    <select className="form-select modal-select" ref={this.ref_options} aria-label="Default select example" onChange={this.onChangeOption.bind(this)}>
                        {option_items}
                    </select>
                </div>
            </div>
        );
    }
}