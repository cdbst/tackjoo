
class ContentsAccounts extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount(){
        
    }

    render() {

        return (
            <div className="container-fluid">
                <AddAccountModal id="add-account-modal"/>
                <br/>
                <div className="row">
                    <div className="col">
                        <h3 className="contents-title">TEST : Accounts (4/10)</h3>
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
                            <th scope="col">Validation</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AccountsTableItem data={{email : 'pakd123@naver.com', status : 'login'}}/>
                    </tbody>
                </table>
                </div>
                <div className="row footer">
                    <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                        <button type="button" class="btn btn-primary btn-footer-inside" data-bs-toggle="modal" data-bs-target="#add-account-modal">
                            <img src="./res/file-plus-fill.svg" style={{width:24, height:24}}/> New Account
                        </button>
                        <button type="button" class="btn btn-warning btn-footer-inside">
                            <img src="./res/door-open-fill.svg" style={{width:24, height:24}}/> Login All
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}