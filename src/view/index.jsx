'use strict';

const e = React.createElement;

class Index extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <MenuBar></MenuBar>
        );
    }
}

const domContainer = document.querySelector('#index-container');
ReactDOM.render(e(Index), domContainer);