'use strict';

class CommonTitleBar extends React.Component {

    constructor(props){
        super(props);
        this.ref_menubar_ctrls = React.createRef();

        this.onDBClickDragArea = this.onDBClickDragArea.bind(this);
    }

    onDBClickDragArea(){
        console.log('onDBClickDragArea');
        this.ref_menubar_ctrls.current.toggleMaximizedStatus(false);
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
                    <ul className="nav justify-content-end app-drag-area" style={{width:'calc(100% - 160px)'}} onDoubleClick={this.onDBClickDragArea.bind(this)}/>
                </ul>
                <MenuBarWindowControls ref={this.ref_menubar_ctrls}/>
            </div>
        );
    }
}