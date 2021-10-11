
class TasksTableItem extends React.Component {
    constructor(props) {
        super(props);

    }

    // <th scope="col">Type</th>
    // <th scope="col">Product</th>
    // <th scope="col">Size</th>
    // <th scope="col">Account</th>
    // <th scope="col">Status</th>
    // <th scope="col">Open Time</th>
    // <th scope="col">Actions</th> 
    // 엑션 종류 : 편집, 시작/멈춤, 제거, 예약

    render(){
        
        return(
            <tr>
                <td >
                    <span>test type</span>
                </td>
                <td >
                    <span>test product</span>
                </td>
                <td >
                    <span>test size</span>
                </td>
                <td >
                    <span>test account</span>
                </td>
                <td >
                    <span>test status</span>
                </td>
                <td >
                    <span>test open time</span>
                </td>
                <td >
                    <div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-warning" >
                                <img src="./res/img/door-open-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-danger" >
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                        <div className="float-start button-wrapper-inner-table">
                            <button type="button" className="btn btn-danger" >
                                <img src="./res/img/trash-fill.svg" style={{width:24, height:24}}/>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}