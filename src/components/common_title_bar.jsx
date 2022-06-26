'use strict';

class CommonTitleBar extends React.Component {

    constructor(props){
        super(props);
    }

    render() {
        return (
            <div className="title-bar" >
                <ul className="nav nav-tabs" style={{height: 42}}>
                    <li className="nav-item" style={{paddingLeft: 12}}>
                        <img className="nav-bar-icon" src="./res/img/icon.ico" style={{cursor:'default'}}/>
                    </li>
                    <li className="nav-item" style={{paddingLeft: 4}}>
                        <a className="nav-link">TACKJOO</a>
                    </li>
                    <ul className="nav justify-content-end app-drag-area" style={{width:'calc(100% - 160px)'}}/>
                </ul>
                <MenuBarWindowControls />
            </div>
        );
    }
}