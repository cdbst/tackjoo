class ProxyTableItem extends React.Component {

    constructor(props) {
        super(props);

        this.onClickRemoveBtn = this.onClickRemoveBtn.bind(this);
        this.conClickEditBtn = this.conClickEditBtn.bind(this);

        this.__mount = false;
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    onClickRemoveBtn(){
        this.props.h_remove(this.props.proxy_info._id);
    }

    conClickEditBtn(){
        this.props.h_modify(this.props.proxy_info._id);
    }

    render(){
        return(
            <tr>
                <td style={{width : this.props.ip_col_width, maxWidth : this.props.ip_col_width}}>
                    <span>{this.props.proxy_info.ip}</span>
                </td>
                <td style={{width : this.props.port_col_width, maxWidth : this.props.port_col_width}}>
                    <span>{this.props.proxy_info.port}</span>
                </td>
                <td style={{width : this.props.username_col_width, maxWidth : this.props.username_col_width}}>
                    <span>{this.props.proxy_info.id}</span>
                </td>
                <td style={{width : this.props.alias_col_width, maxWidth : this.props.alias_col_width}}>
                    <div className="cut-text" style={{width : this.props.alias_col_width, maxWidth : this.props.alias_col_width}} title={this.props.proxy_info.alias}>{this.props.proxy_info.alias}</div>
                </td>
                <td style={{width : this.props.action_col_width, maxWidth : this.props.action_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-warning" onClick={this.conClickEditBtn.bind(this)}>
                                <img src="./res/img/pencil-square.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-danger" onClick={this.onClickRemoveBtn.bind(this)}>
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}