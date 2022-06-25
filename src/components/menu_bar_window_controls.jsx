'use strict';

class MenuBarWindowControls extends React.Component {

    render(){
        return(
            <div className="window-controls">
                <div className="control-button" id="min-button">
                    <img className="icon" srcSet="./res/img/win-ctrl-icons/min-w-10.png 1x, ./res/img/win-ctrl-icons/min-w-12.png 1.25x, ./res/img/win-ctrl-icons/min-w-15.png 1.5x, ./res/img/win-ctrl-icons/min-w-15.png 1.75x, ./res/img/win-ctrl-icons/min-w-20.png 2x, ./res/img/win-ctrl-icons/min-w-20.png 2.25x, ./res/img/win-ctrl-icons/min-w-24.png 2.5x, ./res/img/win-ctrl-icons/min-w-30.png 3x, ./res/img/win-ctrl-icons/min-w-30.png 3.5x" draggable="false" />
                </div>

                <div className="control-button" id="max-button">
                    <img className="icon" srcSet="./res/img/win-ctrl-icons/max-w-10.png 1x, ./res/img/win-ctrl-icons/max-w-12.png 1.25x, ./res/img/win-ctrl-icons/max-w-15.png 1.5x, ./res/img/win-ctrl-icons/max-w-15.png 1.75x, ./res/img/win-ctrl-icons/max-w-20.png 2x, ./res/img/win-ctrl-icons/max-w-20.png 2.25x, ./res/img/win-ctrl-icons/max-w-24.png 2.5x, ./res/img/win-ctrl-icons/max-w-30.png 3x, ./res/img/win-ctrl-icons/max-w-30.png 3.5x" draggable="false" />
                </div>

                <div className="control-button" id="close-button">
                    <img className="icon" srcSet="./res/img/win-ctrl-icons/close-w-10.png 1x, ./res/img/win-ctrl-icons/close-w-12.png 1.25x, ./res/img/win-ctrl-icons/close-w-15.png 1.5x, ./res/img/win-ctrl-icons/close-w-15.png 1.75x, ./res/img/win-ctrl-icons/close-w-20.png 2x, ./res/img/win-ctrl-icons/close-w-20.png 2.25x, ./res/img/win-ctrl-icons/close-w-24.png 2.5x, ./res/img/win-ctrl-icons/close-w-30.png 3x, ./res/img/win-ctrl-icons/close-w-30.png 3.5x" draggable="false" />
                </div>
            </div>
        );
    }
}