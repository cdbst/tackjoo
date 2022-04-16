class ToggleButton extends React.Component {

    constructor(props) {
        super(props);

        this.__onClick = this.__onClick.bind(this);
        this.__onRightClick = this.__onRightClick.bind(this);
        this.setDisabled = this.setDisabled.bind(this);
        this.setBtnState = this.setBtnState.bind(this);
        this.getState = this.getState.bind(this);

        this.__ref_btn = React.createRef();

        this.state = {
            set : this.props.init_state
        }
    }

    __onClick(){
        
        this.setState(prevState => ({
            set : !prevState.set,
        }), ()=>{
            this.props.h_on_click(this.state.set);
        });
    }

    __onRightClick(){
        this.props.h_on_right_click();
    }

    setDisabled(status){
        this.__ref_btn.current.disabled = status;
    }

    setBtnState(status){
        this.setState(_ => ({
            set : status
        }));
    }

    getState(){
        return this.state.set;
    }

    render(){

        const btn_img_src = this.state.set ? this.props.set_img_src : this.props.unset_img_src;
        let btn_label = undefined;

        if(this.props.set_btn_label === undefined || this.props.unset_btn_label){
            btn_label = this.state.set ? this.props.set_btn_label : this.props.unset_btn_label;
        }

        return(
            <button ref={this.__ref_btn} 
                type="button" 
                className={"btn " + this.props.btn_class} 
                onClick={this.__onClick.bind(this)} 
                onContextMenu={this.__onRightClick.bind(this)}>
                <img src={btn_img_src} style={{width:24, height:24}}/>
                { btn_label !== undefined && btn_label }
            </button>
        );
    }
}