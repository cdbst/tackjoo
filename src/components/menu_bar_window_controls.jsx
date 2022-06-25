'use strict';

class MenuBarWindowControls extends React.Component {

    constructor(props) {
        super(props);
        this.onClickMinBtn = this.onClickMinBtn.bind(this);
        this.onClickMaxBtn = this.onClickMaxBtn.bind(this);
        this.onClickCloseBtn = this.onClickCloseBtn.bind(this);
        this.onClickRestoreBtn = this.onClickRestoreBtn.bind(this);
        
        this.state = {
            maximized : false
        }
    }

    onClickMinBtn(){
        window.electron.minimizeProgram();
    }

    onClickMaxBtn(){
        this.setState({
            maximized : true
        }, ()=>{
            window.electron.maximizeProgram();
        })
        
    }
    
    onClickRestoreBtn(){
        this.setState({
            maximized : false
        }, ()=>{
            window.electron.restoreSizeProgram();
        })
    }

    onClickCloseBtn(){
        window.electron.exitProgram();
    }

    render(){
        return(
            <div className="window-controls">
                <div className="window-control-button window-control-min-button" onClick={this.onClickMinBtn.bind(this)}>
                    <img className="window-control-button-icon" srcSet="./res/img/win-ctrl-icons/min-w-10.png 1x, ./res/img/win-ctrl-icons/min-w-12.png 1.25x, ./res/img/win-ctrl-icons/min-w-15.png 1.5x, ./res/img/win-ctrl-icons/min-w-15.png 1.75x, ./res/img/win-ctrl-icons/min-w-20.png 2x, ./res/img/win-ctrl-icons/min-w-20.png 2.25x, ./res/img/win-ctrl-icons/min-w-24.png 2.5x, ./res/img/win-ctrl-icons/min-w-30.png 3x, ./res/img/win-ctrl-icons/min-w-30.png 3.5x" draggable="false" />
                </div>

                <div className="window-control-button window-control-max-button" onClick={this.onClickMaxBtn.bind(this)} style={{display : this.state.maximized ? 'none' : ''}}>
                    <img className="window-control-button-icon" srcSet="./res/img/win-ctrl-icons/max-w-10.png 1x, ./res/img/win-ctrl-icons/max-w-12.png 1.25x, ./res/img/win-ctrl-icons/max-w-15.png 1.5x, ./res/img/win-ctrl-icons/max-w-15.png 1.75x, ./res/img/win-ctrl-icons/max-w-20.png 2x, ./res/img/win-ctrl-icons/max-w-20.png 2.25x, ./res/img/win-ctrl-icons/max-w-24.png 2.5x, ./res/img/win-ctrl-icons/max-w-30.png 3x, ./res/img/win-ctrl-icons/max-w-30.png 3.5x" draggable="false" />
                </div>

                <div className="window-control-button window-control-restore-button" onClick={this.onClickRestoreBtn.bind(this)} style={{display : this.state.maximized ? '' : 'none'}}>
                    <img className="window-control-button-icon" srcSet="./res/img/win-ctrl-icons/restore-w-10.png 1x, ./res/img/win-ctrl-icons/restore-w-12.png 1.25x, ./res/img/win-ctrl-icons/restore-w-15.png 1.5x, ./res/img/win-ctrl-icons/restore-w-15.png 1.75x, ./res/img/win-ctrl-icons/restore-w-20.png 2x, ./res/img/win-ctrl-icons/restore-w-20.png 2.25x, ./res/img/win-ctrl-icons/restore-w-24.png 2.5x, ./res/img/win-ctrl-icons/restore-w-30.png 3x, ./res/img/win-ctrl-icons/restore-w-30.png 3.5x" draggable="false" />
                </div>

                <div className="window-control-button window-control-close-button" onClick={this.onClickCloseBtn.bind(this)}>
                    <img className="window-control-button-icon" srcSet="./res/img/win-ctrl-icons/close-w-10.png 1x, ./res/img/win-ctrl-icons/close-w-12.png 1.25x, ./res/img/win-ctrl-icons/close-w-15.png 1.5x, ./res/img/win-ctrl-icons/close-w-15.png 1.75x, ./res/img/win-ctrl-icons/close-w-20.png 2x, ./res/img/win-ctrl-icons/close-w-20.png 2.25x, ./res/img/win-ctrl-icons/close-w-24.png 2.5x, ./res/img/win-ctrl-icons/close-w-30.png 3x, ./res/img/win-ctrl-icons/close-w-30.png 3.5x" draggable="false" />
                </div>
            </div>
        );
    }
}