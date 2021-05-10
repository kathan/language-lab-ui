import React from 'react';
import DrawingCanvas from './components/DrawingCanvas';

class App extends React.Component{
    constructor(props) {
        super(props);
    }
    
    render(){
        return (
            <React.Fragment>
                <DrawingCanvas/>
            </React.Fragment>
        );
    }
}

export default App;