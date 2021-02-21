import "./css/editor-styles.css";
import { useState, useRef, useEffect } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";
import { Grid, MenuItem, Button, ButtonGroup, Select } from "@material-ui/core";
import editorButtons from "./editorUtils.js";

var yourPoints = 0;
var opponentPoints = 0;
var connection;

var map = {};
map["java"] = "java";
map["cpp"] = "c_cpp";
map["pyton3"] = "python";

// var HOST = window.location.origin.replace(/^http/, 'ws')
var url="wss://codingduel.herokuapp.com";
// var url="ws://localhost:4000";

function Editor() {
  const aceRef = useRef();
  const stdinRef = useRef();
  const stdoutRef = useRef();
  const problemCodeRef = useRef();
  const [language, setLanguage] = useState("cpp");

  useEffect(() => {
    connection = new WebSocket(url);
    connection.onopen = function () {
      connection.send(
        JSON.stringify({
          type: "get_score",
          roomName: window.$roomName,
          name: window.$name,
        })
      );
      connection.onclose = function () {
        // Try to reconnect in 3 seconds
        setTimeout(function () {
          start(url);
        }, 3000);
      };
    };
    function start(url) {
      console.log("attempting to recnnect...");
      connection = new WebSocket(url);
      connection.onclose = function () {
        // Try to reconnect in 3 seconds
        setTimeout(function () {
          start(url);
        }, 3000);
      };
    }
    connection.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type == "score") {
        yourPoints = data.score.your;
        opponentPoints = data.score.opponent;
      } else if (data.type == "got_score") {
        if (window.$name == data.name) {
          yourPoints = data.score;
        } else {
          opponentPoints = data.score;
        }
      }
      try {
        document.getElementById("yourPoints").innerText = yourPoints + " |";
        document.getElementById("opponentPoints").innerText =
          "| " + opponentPoints;
      } catch (err) {
        alert("cannot set points, try again");
      }
    };
  }, []);
  async function handleRun() {
    const userCode = aceRef.current.editor.getValue();
    const stdin = stdinRef.current.value;
    var output = await editorButtons.runCode(
      userCode,
      stdin,
      language,
      window.$roomName,
      window.$name
    );
    stdoutRef.current.value = output;
  }
  async function handleSubmit() {
    const userCode = aceRef.current.editor.getValue();
    const problemCode = problemCodeRef.current.value;
    var verdict = await editorButtons.submitCode(
      userCode,
      problemCode,
      language,
      window.$roomName,
      window.$name
    );
    verdict = JSON.parse(verdict);
    console.log(verdict)
    if (verdict.verdict == "OK") {
      if(window.$contest){
        yourPoints += verdict.points;
        document.getElementById("yourPoints").innerText = yourPoints + " |";
        connection.send(
          JSON.stringify({
            type: "store_score",
            roomName: window.$roomName,
            name: window.$name,
            score: yourPoints,
          })
        );
      }
    }
    stdoutRef.current.value = verdict.verdict;
  }
  function handleLanguageChange(e) {
    setLanguage(e.target.value);
  }

  return (
    // <div className="editor_wrapper">
    <Grid container item spacing={3}>
      <Grid item xs={12}>
        <AceEditor
          height="600px"
          width="1000px"
          ref={aceRef}
          mode="c_cpp"
          theme="dracula"
          name="UNIQUE_ID_OF_DIV"
          editorProps={{ $blockScrolling: true }}
          // highlightActiveLine="true"
          setOptions={{
            fontSize: "16pt",
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            // display:"inline-block"
          }}
        />
      </Grid>
      <Grid item xs={12} direction="row" justify="center" alignItems="center">
        <Select
          name="language"
          id="languageSelector"
          className="language_selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <MenuItem value="cpp">c++</MenuItem>
          <MenuItem value="java">java</MenuItem>
          <MenuItem value="python3">python3</MenuItem>
        </Select>
        <ButtonGroup>
          <Button color="primary" variant="contained" onClick={handleRun}>
            {" "}
            Run{" "}
          </Button>
          <Button color="primary" variant="contained" onClick={handleSubmit}>
            {" "}
            Submit{" "}
          </Button>
        </ButtonGroup>
      </Grid>
      <Grid item xs={12}>
        <textarea
          placeholder="Problem Code"
          ref={problemCodeRef}
          name="problemCode"
          className="problem_code"
          cols="7"
          rows="7"
        ></textarea>
      </Grid>
      <Grid item xs={12}>
        <textarea
          placeholder="Input"
          ref={stdinRef}
          name="inputArea"
          className="editor_console"
          cols="10"
          rows="10"
        ></textarea>

        <textarea
          placeholder="Output"
          ref={stdoutRef}
          name="outputArea"
          className="editor_console"
          cols="10"
          rows="10"
        ></textarea>
      </Grid>
    </Grid>
    // {/* </div> */}
  );
}

export default Editor;
