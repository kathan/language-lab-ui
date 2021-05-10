import React, { useRef, useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';

class DrawingCanvas extends React.Component{
    constructor(props){
        super(props);
        this.canvas = null;
        this.context = null;
        this.canvasRef = React.createRef();
        this.state = {
            result: ''
        };
    }
    
    async doOCR(){
        const { data: { text } } = await Tesseract.recognize(canvas,
        'eng',
        {
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            tessedit_pageseg_mode: 8,
            logger: m => console.log(m) 
        });
        this.setState({result:text});
        console.log(text);
    }

    clearCanvas(){
        this.context.fillStyle = '#fff';
        this.context.fillRect(0, 0, canvas.width, canvas.height);
    }

    componentDidMount(){
        this.canvas = this.canvasRef.current;
        const context = canvas.getContext("2d");
        this.context = context;
        
        this.context.fillStyle = '#fff';
        this.context.lineWidth = 4;
        this.context.fillRect(0, 0, canvas.width, canvas.height);

        this.context.lineCap = "round";
        let paint = false;
        const left = canvas.offsetLeft;
        const top = canvas.offsetTop;

        this.canvas.addEventListener('mousedown', function(e){
            if(e.button == 0){
                paint = true;
                context.beginPath();
                context.moveTo(e.pageX-left, e.pageY-top);
            } else {
                paint = false;
            }
        });

        this.canvas.addEventListener('mousemove', function(e){
            if(paint){
                context.lineTo(e.pageX-left, e.pageY-top);
                context.stroke();
            }
        });

        this.canvas.addEventListener('mouseup', function(e){
            if(e.button != 0){
                paint = true;
            } else {
                paint = false;
                context.lineTo(e.pageX-left, e.pageY-top);
                context.stroke();
                context.closePath();
            }
        });
    }
    
    render(){
        return (
            <div>
                <div>Result: {this.state.result}</div>
                <canvas ref={this.canvasRef} id="canvas" width="800" height="400" />
                <div>
                    <button onClick={this.doOCR.bind(this)}>
                        Check
                    </button>
                    <button onClick={this.clearCanvas}>
                        Clear
                    </button>
                </div>
            </div>
        );
    }
}

export default DrawingCanvas;