
class ContentsProxies extends React.Component {

    constructor(props) {
        super(props);

        this.__setupColumnsWidth = this.__setupColumnsWidth.bind(this);

        this.__setupColumnsWidth();
        this.__mount = false;
    }

    __setupColumnsWidth(){
        this.actions_col_width = 240;
        this.port_col_width = 120;
        this.ip_col_width = 240; //'calc( 100% - ' + (this.actions_col_width + this.port_col_width) + 'px)';

        this.username_col_width = 'calc( 100% - ' + (this.actions_col_width + this.port_col_width + this.ip_col_width) + 'px)';
    }

    componentDidMount(){
        this.__mount = true;
    }

    componentWillUnmount(){
        this.__mount = false;
    }

    render() {

        return (
            <div className="tab-pane fade" id="proxies" role="tabpanel" aria-labelledby={MenuBar.MENU_ID.PROXIES}>
                <div className="container-fluid">
                    <br/>
                    <div className="row">
                        <div className="col">
                            <h4 className="contents-title">Proxies</h4>
                        </div>
                        <div className="col">
                            {/* <a>TEST : search item interface</a> */}
                        </div>
                    </div>
                    <div className="table-wrapper">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style={{width : this.ip_col_width, maxWidth : this.ip_col_width}}>IP</th>
                                <th scope="col" style={{width : this.port_col_width, maxWidth : this.port_col_width}}>Port</th>
                                <th scope="col" style={{width : this.username_col_width, maxWidth : this.username_col_width}}>User Name</th>
                                <th scope="col" style={{width : this.actions_col_width, maxWidth : this.actions_col_width}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* "table items" */}
                        </tbody>
                    </table>
                    </div>
                    <div className="row footer">
                        <div className="d-flex flex-row-reverse bd-highlight align-items-center">
                            <button type="button" className="btn btn-primary btn-footer-inside" onClick={()=>{console.log('Add Proxy Server test!')}}>
                                <img src="./res/img/file-plus-fill.svg" style={{width:24, height:24}}/> Add Proxy
                            </button>
                            <button type="button" className="btn btn-warning btn-footer-inside" onClick={()=>{console.log('Bulk Add test!')}}>
                                <img src="./res/img/lightning-fill.svg" style={{width:24, height:24}}/> Add Bulk
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}