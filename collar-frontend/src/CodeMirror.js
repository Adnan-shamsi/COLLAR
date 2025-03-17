import React, { useState, useEffect, useCallback } from "react";
import { UnControlled as CodeMirrorEditor } from "react-codemirror2";
import Editor from "./lib/editor";
import Controller from "./lib/controller";
import Broadcast from "./lib/broadcast";

import "./Editor.css"

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';

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
	const [fontSize, setFontSize] = useState("15px");
	const [broadcast, setBroadcast] = useState(null);
	const [compileModal, setCompileModal] = useState(false)
	const [settingsModal, setSettingsModal] = useState(false)
	const [compiling, setCompiling] = useState(false)
	const [outputModal, setOutputModal] = useState(false)
	const [inputValue, setInputValue] = useState("")
	const [outputValue, setOutputValue] = useState("")

	const handleCompileClose = () => setCompileModal(false)
	const handleCompileShow = () => setCompileModal(true)

	const handleSettingsClose = () => setSettingsModal(false)
	const handleSettingsShow = () => setSettingsModal(true)

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
		console.log(result?.response?.status != 200)
		console.log(result?.statusCode != 200)
		if (result?.response?.status != 200 && result?.statusCode != 200) {
			setOutputValue({ output: `An error occured: ${result.response.message}` })
		}
		else {
			setOutputValue(result)
		}
		handleCompileOff()

	}, [inputValue, broadcast, editorRef]);

	const handleInputChange = (event) => {
		setInputValue(event.target.value)
	}

	return (
		<>
			<Container fluid className="p-0 m-0 w-100 min-vh-100 d-flex flex-column">
				<Navbar className="justify-content-between">
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Container className="m-0 w-auto">
						<Navbar.Brand href="#home">COLLAR</Navbar.Brand>
					</Container>
					<Container className="m-0 w-auto">
						<div>
							<Button variant="secondary" style={{ width: "10em" }} onClick={handleCompileShow}>
								COMPILE
								<img
									src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg"
									alt="Python Logo"
									style={{ marginLeft: "1em", width: '1.5em', height: '1.5em' }}
								/>
							</Button>
						</div>
					</Container>
					<Container className="m-0 w-auto d-none d-md-block">
						<Navbar.Collapse id="basic-navbar-nav">
							<Nav className="me-auto">
								<Nav.Link onClick={handleSettingsShow}>⚙️</Nav.Link>
								<Nav.Link href="www.github.com/AzimJaved">Azim J.</Nav.Link>
								<Nav.Link href="www.github.com/Adnan-shamsi">Adnan S.</Nav.Link>
							</Nav>
						</Navbar.Collapse>
					</Container>

				</Navbar >
				<div
					style={{
						flex: 1,
						width: "100%",
						fontSize: `${fontSize}`,
						overflow: "auto",
						display: "flex"
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
						}}
					/>
				</div>
			</Container>
			<Modal show={compileModal} onHide={handleCompileClose}>
				<Modal.Header closeButton>
					<Modal.Title>Compile 								<img
						src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg"
						alt="Python Logo"
						style={{ marginLeft: "10px", width: '1.5em', height: '1.5em' }}
					/></Modal.Title>
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
						Done
					</Button>
				</Modal.Footer>
			</Modal>
			<Modal show={settingsModal} onHide={handleSettingsClose}>
				<Modal.Header closeButton>
					<Modal.Title>Settings</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div>
						<Form.Label>Select a Theme: </Form.Label>
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
						<Form.Label>Select a Font Size: </Form.Label>
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
					</div >
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleOutputClose}>
						Done
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default CodeMirror;
