import React, { useState, useEffect, useCallback } from "react";
import { UnControlled as CodeMirrorEditor } from "react-codemirror2";
import Editor from "./lib/editor";
import Controller from "./lib/controller";
import Broadcast from "./lib/broadcast";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/python/python";
import { testRepeat } from "./lib/testScript";

const CodeMirror = () => {
  const [code, setCode] = useState(null);
  const [editorRef, setEditorRef] = useState(null);

  const cb = useCallback((time, i) => {
    editorRef.setValue('time: ' + time + '; i: ' + i)
  }, [editorRef])
  
  useEffect(() => {
    if (editorRef) {
      console.log("done");
      const editor = new Editor(editorRef);
      new Controller("jinga", new Broadcast(), editor);
      // editorRef.setValue('azimjaved23')
    
      testRepeat(cb, 10, Date.now() + 10000)
      console.log("done2");
    }
  }, [editorRef, cb]);



  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        fontSize: `30px`,
        overflow: "auto",
      }}
    >
      <CodeMirrorEditor
        autoScroll
        options={{
          mode: "c++",
          theme: "monokai",
          spellChecker: false,
          toolbar: true,
          autofocus: true,
          indentWithTabs: true,
          tabSize: 4,
          indentUnit: 4,
          lineWrapping: false,
          shortCuts: [],
        }}
        editorDidMount={(editor) => {
          setEditorRef(editor);
          editor.setSize("98vw", "97vh");
        }}
      />
    </div>
  );
};

export default CodeMirror;
