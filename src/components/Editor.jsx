import React, { useEffect, useRef } from "react";
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from "../Action";

function Editor({socketRef, roomId, onCodeChange}){
    const editorRef = useRef(null);
    useEffect(() => {
        async function init(){
            editorRef.current = Codemirror.fromTextArea(document.getElementById('realtimeEditor'), {
                mode: {name: 'javascript', json: true},
                theme: 'dracula',
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers: true
            });
            // Adding event listener to the code editor
            // change is an event of code-mirror
            // instance is instance of editor and changes is the change that is happening in the editor
            editorRef.current.on('change', (instance, changes) => {
                console.log(changes);
                const {origin} = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if(origin !== 'setValue'){
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId, 
                        code,
                    });
                }
            });

            
        }
        init();
    }, []);


    useEffect(() => {
        if(socketRef.current){
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({code})=>{
                if(code != null){
                    editorRef.current.setValue(code);
                }
            });
        }

        //Un-subscribing the event
        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        }
    }, [socketRef.current]);


    return (
        <textarea id="realtimeEditor"></textarea>
    )
}

export default Editor;