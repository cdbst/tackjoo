
class ContentsAccounts extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="container-fluid">
                <br/>
                <div className="row">
                    <div className="col">
                        <h3>TEST : Accounts (4/10)</h3>
                    </div>
                    <div className="col">
                        <a>TEST : search item interface</a>
                    </div>
                </div>
                <div className="table-wrapper">
                <table className="table table-hover">
                    <thead>
                        <tr>
                        <th scope="col">E-Mail</th>
                        <th scope="col">User Name</th>
                        <th scope="col">Validation</th>
                        <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>pakd123@naver.com</td>
                            <td>박현욱</td>
                            <td>Valid</td>
                            <td>
                                <div>
                                    <div className="float-start button-wrapper">
                                        <button type="button" className="btn btn-success"><img src="./res/door-open-fill.svg" style={{width:24, height:24}}/></button>
                                    </div>
                                    <div className="float-start button-wrapper">
                                        <button type="button" className="btn btn-light"><img src="./res/pencil-square.svg" style={{width:24, height:24}}/></button>
                                    </div>
                                    <div className="float-start button-wrapper">
                                    <button type="button" className="btn btn-danger"><img src="./res/trash-fill.svg" style={{width:24, height:24}}/></button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>
                <div className="row footer">
                    <div className="col">
                        <h3>TEST : Add New Account Button</h3>
                    </div>
                </div>
            </div>
        );
    }
}