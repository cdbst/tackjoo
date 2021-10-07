class AddAccountModal extends React.Component {
    constructor(props) {
        super(props);

        this.accounts = undefined;
    }

    componentDidMount(){
        
    }

    render(){
        return (
            <div class="modal fade" id={this.props.id} data-bs-keyboard="false" tabindex="-1" aria-labelledby={this.props.id + '-label'} aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id={this.props.id + '-label'}>Modal title</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ...
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary">Understood</button>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}