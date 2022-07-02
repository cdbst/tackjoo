

class AddressSearchForm extends React.Component {

    style_search_result_group = {
        display: 'inline-block', 
        position: 'absolute',
        top: 40,
        overflowY: 'auto',
        maxHeight: 240,
        width: 468,
        zIndex: 500,
    }

    style_search_result = {
        background: '#32353b',
        border : '1px solid rgba(255, 255, 255, 0.5)',
        cursor : 'pointer'
    }

    constructor(props) {
        super(props);

        this.onClickSearch = this.onClickSearch.bind(this);
        this.getSearchResultList = this.getSearchResultList.bind(this);
        this.onClickAddrItem = this.onClickAddrItem.bind(this);

        this.getDoroAddr = this.getDoroAddr.bind(this);
        this.getJibeonAddr = this.getJibeonAddr.bind(this);

        this.onKeyUpAddrInput = this.onKeyUpAddrInput.bind(this);

        this.search_input_ref = React.createRef();
        this.selected_addr_info = undefined;
        
        this.state = {
            search_result_list : [],
            search_result_select_mode : false,
        }
    }

    onKeyUpAddrInput(e){
        e.preventDefault();
        if(e.key !== 'Enter') return;
        this.onClickSearch();
    }

    onClickSearch(){
        
        const addr_to_search = this.search_input_ref.current.value;

        if(addr_to_search == undefined || addr_to_search == ''){
            Index.g_sys_msg_q.enqueue('에러', '검색할 주소를 입력하세요.', ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
            return;
        }

        window.electron.searchAddr(addr_to_search, (err, search_result) =>{

            if(err){
                Index.g_sys_msg_q.enqueue('에러', err, ToastMessageQueue.TOAST_MSG_TYPE.ERR, 5000);
                return;
            }

            this.setState({
                search_result_list : this.getSearchResultList(search_result),
                search_result_select_mode : true,
            });
        });
    }

    onClickAddrItem(addr_info){
        this.selected_addr_info = addr_info;
        this.search_input_ref.current.value = `(${addr_info.postcode5}) ${this.getDoroAddr(addr_info)}`;
        this.setState({
            search_result_list : [],
            search_result_select_mode : true,
        });
    }

    getSearchResultList(search_result){
        
        return search_result.map((addr_info)=>{
            return (
                <li key={addr_info.address_id} className="list-group-item d-flex justify-content-between align-items-start" style={this.style_search_result} onClick={this.onClickAddrItem.bind(this, addr_info)}>
                    <div className="me-auto" style={{width: '100%'}}>
                        <div className="row">
                            <div className="col-md-12" style={{fontSize: 14}}>{`${addr_info.postcode5} (${addr_info.postcode6})`}</div>
                        </div>
                        <div className="row">
                            <div className="col-md-3">도로명</div>
                            <div className="col-md-9">{this.getDoroAddr(addr_info)}</div>
                        </div>
                        <div className="row">
                            <div className="col-md-3">지번</div>
                            <div className="col-md-9">{this.getJibeonAddr(addr_info)}</div>
                        </div>
                    </div>
                </li>
            );
        });
    }

    getDoroAddr(addr_info){
        return `${addr_info.ko_common} ${addr_info.ko_doro}`;
    }

    getJibeonAddr(addr_info){
        return `${addr_info.ko_common} ${addr_info.ko_jibeon}`;
    }

    render(){
        return(
            <div className="input-group">
                <input ref={this.search_input_ref} type="text" className="form-control" placeholder="주소 검색" aria-label="주소 검색" style={{'--width' : this.props.width}} onKeyUp={this.onKeyUpAddrInput.bind(this)}/>
                <button className="btn btn-primary" type="button" onClick={this.onClickSearch.bind(this)} >검색</button>
                <ol className="list-group" style={{...this.style_search_result_group, display: this.state.search_result_select_mode ? 'inline-block' : 'none'}}>
                    {this.state.search_result_list}
                </ol>
            </div>
        );
    }
}