


class AccountsTableItem extends React.Component {
    constructor(props) {
        
        super(props);

        this.onClickLogin = this.onClickLogin.bind(this);
        this.onClickRemove = this.onClickRemove.bind(this);
    }

    onClickLogin(){
        this.props.h_login(this.props.data.email, this.props.data.pwd);
    }

    onClickRemove(){
        this.props.h_remove(this.props.data.email);
    }

    render(){
        return(
            <tr>
                <td style={{width : this.props.email_col_width}}>{this.props.data.email}</td>
                <td style={{width : this.props.status_col_width}}>{this.props.data.status}</td>
                <td style={{width : this.props.actions_col_width}}>
                    <div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-warning" onClick={this.onClickLogin.bind(this)}>
                                <img src="./res/door-open-fill.svg" style={{width:24, height:24}}/>
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