import React, { useState, useEffect } from "react";
import { UnControlled as CodeMirrorEditor } from "react-codemirror2";
import Editor from "./lib/editor";
import Controller from "./lib/controller";
import Broadcast from "./lib/broadcast";

import "codemirror/lib/codemirror.css";

import "codemirror/theme/monokai.css";
import "codemirror/theme/abcdef.css";
import "codemirror/theme/ambiance.css";
import "codemirror/theme/cobalt.css";
import "codemirror/theme/darcula.css";
import "codemirror/theme/eclipse.css";
import "codemirror/theme/lesser-dark.css";
import "codemirror/theme/mbo.css";
import "codemirror/theme/pastel-on-dark.css";
import "codemirror/theme/rubyblue.css";
import "codemirror/theme/shadowfox.css";

import "codemirror/mode/clike/clike";
import "codemirror/mode/python/python";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/go/go";

const CodeMirror = () => {
  const allThemes = [
    "abcdef",
    "ambiance",
    "cobalt",
    "darcula",
    "eclipse",
    "lesser-dark",
    "mbo",
    "monokai",
    "pastel-on-dark",
    "rubyblue",
    "shadowfox",
  ];

  const allFontSize = ["15px", "20px", "25px", "30px", "40px"];

  const [editorRef, setEditorRef] = useState(null);
  const [theme, setTheme] = useState("mbo");
  const [fontSize, setFontSize] = useState("25px");
  const [broadcast, setBroadcast] = useState(null);

  useEffect(() => {
    if (editorRef && !broadcast) {
      console.log("done");
      const editor = new Editor(editorRef);
      const bd = new Broadcast();
      setBroadcast(bd);
      new Controller("jinga", bd, editor);
      console.log("done2");
    }
  }, [editorRef, broadcast]);

  const compile = () => {
    if (!broadcast) return alert("no connection");
    //console.log('code Compiles',editorRef.getValue())
    broadcast.codeCompilation({
      language: "python",
      code: editorRef.getValue(),
    });
  };

  return (
    <>
      <div
        style={{
          height: "100%",
          width: "100%",
          fontSize: `${fontSize}`,
          overflow: "auto",
        }}
      >
        <CodeMirrorEditor
          autoScroll
          options={{
            mode: "python",
            theme: theme,
            spellChecker: false,
            toolbar: false,
            autofocus: false,
            indentWithTabs: true,
            tabSize: 4,
            indentUnit: 4,
            lineWrapping: false,
            lineNumbers: true,
            gutter: true,
            shortCuts: [],
          }}
          editorDidMount={(editor) => {
            setEditorRef(editor);
            editor.setSize("98vw", "90vh");
          }}
        />
      </div>
      <div
        style={{
          textAlign: "center",
          margin: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <label for="theme" style={{ marginRight: "10px" }}>
            THEME
          </label>
          <select
            name="theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            {allThemes.map((th, id) => (
              <option key={id} value={th}>
                {th}
              </option>
            ))}
          </select>
        </div>
        <button style={{ fontSize: "2em" }} onClick={compile}>
          COMPILE
        </button>
        <div>
          <label for="fontSize" style={{ marginRight: "10px" }}>
            FONT SIZE
          </label>
          <select
            name="fontSize"
            value={fontSize}
            onChange={(event) => setFontSize(event.target.value)}
          >
            {allFontSize.map((th, id) => (
              <option key={id} value={th}>
                {th}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default CodeMirror;
