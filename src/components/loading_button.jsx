class LaodingButton extends React.Component {

    constructor(props) {
        super(props);

        this.__loading_img_src = './res/img/tail-spin.svg';
        this.state = {
            img_src : this.props.img_src
        }
        this.__ref_btn = React.createRef();
    }

    setLoadingStatus(status){
        
        this.__ref_btn.current.disabled = status;
        
        this.setState(_ => ({
            img_src : status ? this.__loading_img_src : this.props.img_src
        }));
    }

    setDisabled(status){
        this.__ref_btn.current.disabled = status;
    }

    render(){

        const disabled = this.props.disabled === undefined ? false : this.props.disabled;

        return(
            <button ref={this.__ref_btn} type="button" className={"btn " + this.props.btn_class} onClick={()=>{this.props.h_on_click()}} disabled={disabled}>
                <img src={this.state.img_src} style={{width:24, height:24}}/>
                {this.props.btn_label}
            </button>
        );
    }
}