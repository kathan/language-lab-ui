import React from 'react';
import { IconButton, Backdrop, CircularProgress } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import { FaEraser as EraserIcon } from 'react-icons/fa';
import { createWorker, PSM, OEM } from 'tesseract.js';
import { rword } from 'rword';

const wordLength = 3;
const penWidth = 4;
const TOOLS = {
    PEN: 'PEN',
    ERASER: 'ERASER'
};
const MODES = {
    CHECKING_WORD: 'CHECKING_WORD',
    READY: 'READY',
};

class DrawingCanvas extends React.Component{
    constructor(props){
        super(props);
        this.canvas = null;
        this.canvasContext = null;
        this.canvasRef = React.createRef();
        this.state = {
            wrtiting: false,
            writtenWord: '',
            word: '',
            mode: MODES.READY,
            successCount: 0,
            tool: TOOLS.PEN
        };
    }
    
    async checkWord(){
        await this.doOcr();
        const nextWord = this.nextWord.bind(this);
        if(this.state.word.toUpperCase() === this.state.writtenWord.toUpperCase()){
            this.setSuccess();
            setTimeout(function(){ 
                nextWord();
            }, 3000);
        }
    }

    async doOcr(){
        this.setMode(MODES.CHECKING_WORD);
        const worker = createWorker({
            logger: m => console.log(m)
        });
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        await worker.setParameters({
            tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            tessedit_pageseg_mode: PSM.SINGLE_WORD,
        });
        const { data: { text } } = await worker.recognize(this.canvas);
        this.setWrittenWord(text.trim().toUpperCase());
        this.setMode(MODES.READY);
        console.log(text);
    }

    setSuccess(){
        this.setState({
            result: 'Success!',
            successCount: ++this.state.successCount
        });
    }

    clearCanvas(){
        this.canvasContext.fillStyle = '#fff';
        this.canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        this.stopWriting();
    }

    getWord(){
        this.setState({word:rword.generate(1, { length: wordLength }).toUpperCase()});
    }

    setMode(mode){
        this.setState({mode});
    }

    setWrittenWord(writtenWord){
        this.setState({writtenWord});
    }

    setResult(result){
        this.setState({result});
    }

    nextWord(){
        this.clearCanvas();
        this.setResult('');
        this.setWrittenWord('');
        this.getWord();
    }

    isReady(){
        return this.state.mode === MODES.READY;
    }

    startWriting(){
        this.setState({writing:true});
    }

    stopWriting(){
        this.setState({writing:false});
    }

    isWriting(){
        return this.state.writing;
    }

    setPen(){
        this.setState({tool:TOOLS.PEN});
        this.canvasContext.fillStyle = '#fff';
        this.canvasContext.lineWidth = penWidth;
    }

    setEraser(){
        this.setState({tool:TOOLS.ERASER});
        this.canvasContext.strokeStyle = '#fff';
        this.canvasContext.lineWidth = penWidth;
    }

    componentDidMount(){
        const self = this;
        this.canvas = this.canvasRef.current;
        const context = canvas.getContext("2d");
        this.canvasContext = context;
        
        this.canvasContext.fillStyle = '#fff';
        this.canvasContext.lineWidth = penWidth;
        this.canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        this.canvasContext.lineCap = "round";
        const left = this.canvas.offsetLeft;
        const top = this.canvas.offsetTop;

        this.canvas.addEventListener('mousedown', function(e){
            if(self.isReady()){
                if(e.button == 0 ){
                    self.startWriting();
                    context.beginPath();
                    context.moveTo(e.pageX-left, e.pageY-top);
                } else {
                    self.stopWriting();
                }
            }
        });

        this.canvas.addEventListener('mousemove', function(e){
            if(self.isWriting() && self.isReady()){
                context.lineTo(e.pageX-left, e.pageY-top);
                context.stroke();
            }
        });

        this.canvas.addEventListener('mouseup', function(e){
            if(this.isReady()){
                if(e.button != 0){
                    this.startWriting();
                } else {
                    this.stopWriting();
                    context.lineTo(e.pageX-left, e.pageY-top);
                    context.stroke();
                    context.closePath();
                }
            }
            e.stopPropagation();
        }.bind(this));

        document.addEventListener("mouseup", function(e){
            this.stopWriting();
        }.bind(this));
        this.getWord();
    }
    
    render(){
        const open = !this.isReady();
        const youWrote = this.state.writtenWord ? `You wrote "${this.state.writtenWord}"` : '';
        const result = this.state.result ? `Result: "${this.state.result}"` : '';
        const eraserBorder = (this.state.tool === TOOLS.ERASER ? '1px solid black' : '' );
        const penBorder = (this.state.tool === TOOLS.PEN ? '1px solid black' : '' );
        return (
            <div
                style={{
                    textAlign: 'center',
                    margin: 'auto'
                }}
            >
                <div style={{height:16}}>{this.state.successCount} Correct</div>
                <div style={{height:16}}>Write "{this.state.word}"</div>
                <div style={{height:16}}>{youWrote}</div>
                <div style={{height:16}}>{result}</div>
                <Backdrop open={open}>
                    <CircularProgress
                     style={{height:16}}
                    />
                </Backdrop>
                    <div
                        style={{
                            border: '1px solid black',
                            width: 800,
                            height: 64,
                            margin: 'auto'
                        }}
                    >
                        <IconButton
                            onClick={this.setPen.bind(this)}
                            style={{
                                border:{penBorder}
                            }}
                        >
                            <CreateIcon/>
                        </IconButton>
                        <IconButton
                            onClick={this.setEraser.bind(this)}
                            style={{
                                border:{eraserBorder}
                            }}
                        >
                            <EraserIcon/>
                        </IconButton>
                    </div>
                    <canvas 
                        ref={this.canvasRef} 
                        id="canvas" 
                        width="800" 
                        height="400"
                        style={{
                            border: '1px solid black',
                            cursor: 'crosshair'
                        }} 
                    />
                <div
                    style={{
                        width: 400,
                        textAlign: 'center',
                        margin: 'auto'
                    }}
                >
                    <button 
                        style={{
                            float: 'left'
                        }}
                        onClick={this.checkWord.bind(this)}>
                        Check
                    </button>
                    <button onClick={this.clearCanvas.bind(this)}>
                        Clear
                    </button>
                    <button 
                        style={{
                            float: 'right'
                        }}
                        onClick={this.nextWord.bind(this)}
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    }
}

export default DrawingCanvas;