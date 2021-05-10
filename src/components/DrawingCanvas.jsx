import React, { useRef, useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';

const DrawingCanvas = props => {
    const [result, setResult] = useState('');
    let canvas;
    const canvasRef = useRef(null);
    
    const doOCR = async () => {
        const { data: { text } } = await Tesseract.recognize(canvas,
        'eng',
        {
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            tessedit_pageseg_mode: 8,
            logger: m => console.log(m) 
        });
        setResult(text);
        console.log(text);
    };

    useEffect(() => {
        canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        context.fillStyle = '#fff';
        context.lineWidth = 4;
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.lineCap = "round";
        let paint = false;
        const left = canvas.offsetLeft;
        const top = canvas.offsetTop;

        canvas.addEventListener('mousedown', function(e){
            if(e.button == 0){
                paint = true;
                context.beginPath();
                context.moveTo(e.pageX-left, e.pageY-top);
            } else {
                paint = false;
            }
        });

        canvas.addEventListener('mousemove', function(e){
            if(paint){
                context.lineTo(e.pageX-left, e.pageY-top);
                context.stroke();
            }
        });

        canvas.addEventListener('mouseup', function(e){
            if(e.button != 0){
                paint = true;
            } else {
                paint = false;
                context.lineTo(e.pageX-left, e.pageY-top);
                context.stroke();
                context.closePath();
            }
        });
    });
    
    return (
        <div>
            <div>Result: {result}</div>
            <canvas ref={canvasRef} id="canvas" width="800" height="400" />
            <button onClick={doOCR}>
                Check
            </button>
        </div>
    );
}

export default DrawingCanvas;