


class AccountsTableItem extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        return(
            <tr>
                <td>{this.props.data.email}</td>
                <td>{this.props.data.status}</td>
                <td>
                    <div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-primary"><img src="./res/door-open-fill.svg" style={{width:24, height:24}}/></button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-warning"><img src="./res/pencil-square.svg" style={{width:24, height:24}}/></button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-danger"><img src="./res/trash-fill.svg" style={{width:24, height:24}}/></button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}