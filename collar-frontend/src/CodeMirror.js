import React, { useState, useEffect, useCallback } from "react";
import { UnControlled as CodeMirrorEditor } from "react-codemirror2";
import Editor from "./lib/editor";
import Controller from "./lib/controller";
import Broadcast from "./lib/broadcast";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';

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
	const [fontSize, setFontSize] = useState("20px");
	const [broadcast, setBroadcast] = useState(null);
	const [compileModal, setCompileModal] = useState(false)
	const [compiling, setCompiling] = useState(false)
	const [outputModal, setOutputModal] = useState(false)
	const [inputValue, setInputValue] = useState("")
	const [outputValue, setOutputValue] = useState("")

	const handleCompileClose = () => setCompileModal(false)
	const handleCompileShow = () => setCompileModal(true)

	const handleOutputClose = () => setOutputModal(false)
	const handleOutputShow = () => setOutputModal(true)


	const handleCompileOn = () => setCompiling(true)
	const handleCompileOff = () => setCompiling(false)

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

	const compile = useCallback(async () => {
		if (!broadcast) return alert("no connection");
		handleCompileClose()
		handleCompileOn()
		handleOutputShow()
		const result = await broadcast.codeCompilation({
			language: "python",
			code: editorRef.getValue(),
			input: inputValue
		});
		console.log(result)
		setOutputValue(result)
		handleCompileOff()

	}, [inputValue, broadcast, editorRef]);

	const handleInputChange = (event) => {
		setInputValue(event.target.value)
	}

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
						editor.setSize("100vw", "92vh");
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
					<Form.Select
						name="theme"
						value={theme}
						onChange={(event) => setTheme(event.target.value)}
					>
						{allThemes.map((th, id) => (
							<option key={id} value={th}>
								{th}
							</option>
						))}
					</Form.Select>
				</div>
				<div>
					<Button variant="secondary" style={{ fontSize: "1.5em", width: "10em" }} onClick={handleCompileShow}>
						COMPILE
					</Button>
				</div>
				<Modal show={compileModal} onHide={handleCompileClose}>
					<Modal.Header closeButton>
						<Modal.Title>Compile (Python)</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<InputGroup onChange={handleInputChange}>
							<InputGroup.Text>Input: </InputGroup.Text>
							<Form.Control as="textarea" aria-label="Input" />
						</InputGroup>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={handleCompileClose}>
							Close without compiling
						</Button>
						<Button variant="primary" onClick={compile}>
							Compile
						</Button>
					</Modal.Footer>
				</Modal>

				<Modal show={outputModal} onHide={handleOutputClose}>
					<Modal.Header closeButton>
						<Modal.Title>Output</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{
							compiling
								?
								<div>Compiling the code. Please wait ...</div>
								:
								<div>
									{outputValue.output}
								</div>
						}
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={handleOutputClose}>
							Close without compiling
						</Button>
					</Modal.Footer>
				</Modal>

				<div>
					<Form.Select
						name="fontSize"
						aria-label="Font Size"
						value={fontSize}
						onChange={(event) => setFontSize(event.target.value)}
					>
						{allFontSize.map((th, id) => (
							<option key={id} value={th}>
								{th}
							</option>
						))}
					</Form.Select>
				</div>
			</div>
		</>
	);
};

export default CodeMirror;
