import React, { useState, useEffect } from "react";
import { UnControlled as CodeMirrorEditor } from "react-codemirror2";
import Editor from "./lib/editor";
import Controller from "./lib/controller";
import Broadcast from "./lib/broadcast";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/python/python";

const CodeMirror = () => {
  const [code, setCode] = useState(null);
  const [editorRef, setEditorRef] = useState(null);

  useEffect(() => {
    if (editorRef) {
      console.log("done");
      const editor = new Editor(editorRef);
      new Controller("jinga",new Broadcast(), editor);
      console.log("done2");
    }
  }, [editorRef]);

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
          mode: "python",
          theme: "monokai",
          spellChecker: false,
          toolbar: false,
          autofocus: false,
          indentWithTabs: true,
          tabSize: 4,
          indentUnit: 4,
          lineWrapping: false,
          shortCuts: [],
        }}
        editorDidMount={(editor) => {
          setEditorRef(editor);
          editor.setSize("99vw", "97vh");
        }}
      />
    </div>
  );
};

export default CodeMirror;
