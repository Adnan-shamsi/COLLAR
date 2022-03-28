import React, {useState} from "react"
import {UnControlled as CodeMirrorEditor} from 'react-codemirror2';
import 'codemirror/lib/codemirror.css'; 
import 'codemirror/theme/monokai.css';
import "codemirror/mode/python/python";

const CodeMirror = ()=>{
const [code, setCode] = useState(null)
return <div
style={{
  height: "100%",
  width: "100%",
  fontSize: `30px`,
  overflow: "auto",
}}
>
<CodeMirrorEditor
  onChange={(editor, data, value) => {
    console.log(data);  
    setCode(value);
  }}
  autoScroll
  options={{
    mode: 'python',
    theme: 'monokai',
    lineWrapping: true,
    smartIndent: true,
    lineNumbers: true,
    foldGutter: true,
    tabSize: 2,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    autoCloseTags: true,
    matchBrackets: true,
    autoCloseBrackets: true,
  }}
  editorDidMount={(editor) => {
    editor.setSize("99vw", "97vh");
  }}
/>
</div>
}

export default CodeMirror;