


class AccountsTableItem extends React.Component {
    constructor(props) {
        
        super(props);

        this.onClickLogin = this.onClickLogin.bind(this);
        this.onClickModify = this.onClickModify.bind(this);
        this.onClickRemove = this.onClickRemove.bind(this);
    }

    onClickLogin(){
        this.props.h_login(this.props.data.email, this.props.data.pwd)
    }

    onClickModify(){
        this.props.h_modify(this.props.data.email, this.props.data.pwd)
    }

    onClickRemove(){
        this.props.h_remove(this.props.data.email)
    }

    render(){
        return(
            <tr>
                <td>{this.props.data.email}</td>
                <td>{this.props.data.status}</td>
                <td>
                    <div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-info" onClick={this.onClickLogin.bind(this)}>
                                <img src="./res/door-open-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-warning" onClick={this.onClickModify.bind(this)}>
                                <img src="./res/pencil-square.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-danger" onClick={this.onClickRemove.bind(this)}>
                                <img src="./res/trash-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}