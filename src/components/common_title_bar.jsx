'use strict';

class CommonTitleBar extends React.Component {

    render() {
        return (
            <div className="title-bar">
                <ul className="nav nav-tabs" style={{background: 'transparent'}}>
                    <li className="nav-item" style={{paddingLeft: 12}}>
                        <img className="nav-bar-icon" src="./res/img/icon.ico" style={{cursor:'default'}}/>
                    </li>
                </ul>
                <MenuBarWindowControls />
            </div>
        );
    }
}