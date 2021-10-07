class AddAccountModal extends React.Component {
    constructor(props) {
        super(props);

        this.accounts = undefined;
    }

    componentDidMount(){
        
    }

    render(){
        return (
            <div className="modal fade" id={this.props.id} data-bs-keyboard="false" tabIndex="-1" aria-labelledby={this.props.id + '-label'} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id={this.props.id + '-label'}>Add New Account</h5>
                    </div>
                    <div className="modal-body">
                        ...
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-warning" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" className="btn btn-primary">Add</button>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}