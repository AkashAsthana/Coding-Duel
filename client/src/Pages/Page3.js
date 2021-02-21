import React, { useEffect, useState, useRef } from "react";
import "../Components/css/App.css";
import Editor from "../Components/Editor";
import Activity from "../Components/Activity";
import { Grid, TextField, Typography } from "@material-ui/core";
import Timer from "../Components/Timer";
import Points from "../Components/Points";
import { Link } from "react-router-dom";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import methods from "../methods";

const MathJax = window.MathJax;
window.$contest=true;
// var HOST = window.location.origin.replace(/^http/, 'ws')
var url="wss://codingduel.herokuapp.com";
// var url="ws://localhost:4000";
var connection;
var counter = 1;

const useStyles = makeStyles(() => ({
  logoutbtn: {
    position: "absolute",
    right: "2rem",
    marginTop: "1rem",
  },
  textStyle: {
    textAlign: "left",
  },
}));

function Contest(props) {
  const [problems, setProblems] = useState();
  const [currentProblem, setCurrentProblem] = useState();
  const [activities, setActivities] = useState([]);

  function start(url) {
    connection = new WebSocket(url);
    connection.onclose = function () {
      // Try to reconnect in 3 seconds
      setTimeout(function () {
        start(url);
      }, 3000);
    };
  }

  useEffect(() => {
    connection = new WebSocket(url);
    connection.onopen = function () {
      connection.send(
        JSON.stringify({
          type: "get_Question",
          roomName: window.$roomName,
        })
      );
    };

    connection.onclose = function () {
      // Try to reconnect in 3 seconds
      setTimeout(function () {
        start(url);
      }, 3000);
    };

    connection.onmessage = function (message) {
      const fromServer = JSON.parse(message.data);
      if (fromServer.type != undefined && fromServer.type == "activity") {
        // parse activities
        var parsedMessage = fromServer;
        var msg = "";
        var today = new Date();
        var time =
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds();
        if (window.$name === parsedMessage.username) {
          if (parsedMessage.runOrSubmit == "submit") {
            msg = `You submitted your code at ${time}`;
          } else {
            msg = `You ran your code on a sample input at ${time}`;
          }
        } else {
          if (parsedMessage.runOrSubmit == "submit") {
            msg = `${parsedMessage.username} submitted his code at ${time}`;
          } else {
            msg = `${parsedMessage.username} ran his code on a sample input at ${time}`;
          }
        }
        setActivities((oldActivity) => [...oldActivity, msg]);
      } else if (fromServer.type != undefined && fromServer.type == "message") {
        console.log(fromServer.msg);
        setActivities((oldActivity) => [
          ...oldActivity,
          `${fromServer.name} : ${fromServer.msg}`,
        ]);
        const elem=document.getElementById('textChat');
        elem.scrollTop = elem.scrollHeight;
      } else if (fromServer.type == "got_score") {
        if(window.$contest){
          console.log('got score',fromServer.name,fromServer.score);
          if (window.$name != fromServer.name) {
            const opponentPoints = fromServer.score;
            try {
              document.getElementById("opponentPoints").innerText =
                "| " + opponentPoints;
            } catch (err) {
              alert("cannot set points");
            }
          }
        }
      } else {
        const fetchedProblems = fromServer.problems;
        setProblems(fetchedProblems);
        setCurrentProblem(fetchedProblems[0].questionBody);
        startTimer(fromServer.time * 60);
      }
    };
  }, []);

  useEffect(() => {
    console.log("RAN ATHJAX");
    try {
      MathJax.typeset();
    } catch (err) {
      alert("Cannot render problem correctly, try again.");
    }
  }, [currentProblem]);

  function handleClick(e) {
    counter = 1;
    var selection = e.target.textContent;
    const res = problems.filter(
      (problem) => problem.questionBody.questionName === selection
    );
    document.querySelector("textarea[name=problemCode").value =
      res[0].questionDetails.contestId + res[0].questionDetails.index;

    setCurrentProblem(res[0].questionBody);
    var inputTestCase = res[0].questionBody.questionSampleTestCases[0].input;
    var regex = /<br\s*[\/]?>/gi;
    inputTestCase = inputTestCase.replace(regex, "\n");
    document.querySelector('textarea[name="inputArea"]').value = inputTestCase;
  }

  const classes = useStyles();
  function startTimer(duration) {
    const display = document.getElementById("timer");
    var start = Date.now(),
      diff,
      minutes,
      seconds;
    function timer() {
      diff = duration - (((Date.now() - start) / 1000) | 0);
      minutes = (diff / 60) | 0;
      seconds = diff % 60 | 0;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      try {
        display.textContent = minutes + ":" + seconds;
      } catch (err) {
        alert("cannot start timer, try again");
        return;
      }

      if (diff <= 0) {
        clearInterval(timer);
        window.$contest=false;
        const yourPoints= parseInt(document.getElementById('yourPoints').innerText.split("|")[0].trim());
        const opponentPoints = parseInt(document.getElementById('opponentPoints').innerText.split("|")[1].trim());
        console.log(yourPoints,opponentPoints);
        var winner;
        if(yourPoints>opponentPoints){
          winner='won';
        }else if(yourPoints === opponentPoints){
          winner='draw';
        }else{
          winner='lose';
        }
        if(winner !== 'draw')
          alert(`You ${winner}`);
        else
          alert('Draw');
        return;
      }
    }
    timer();
    var timer = setInterval(timer, 1000);
  }

  function sendMessage() {
    connection.send(
      JSON.stringify({
        type: "message",
        name: window.$name,
        roomName: window.$roomName,
        msg: document.getElementById("message").value,
      })
    );
    const elem=document.getElementById('textChat');
    elem.scrollTop = elem.scrollHeight;
  }

  const logout = () => {
    methods.videoStop();
    localStorage.removeItem("jwtToken");
  };

  return (
    <div>
      <Grid container>
        <Grid item sm={4}>
          <Grid item sm={12}>
            <Timer />
          </Grid>
          <Grid item sm={12}>
            <Points />
          </Grid>
          {problems &&
            problems.map((problem, index) => {
              return (
                <Grid item sm={12}>
                  <Button
                    variant="contained"
                    onClick={handleClick}
                    value={problem.questionBody.questionName}
                  >
                    <Typography>{problem.questionBody.questionName}</Typography>
                  </Button>
                </Grid>
              );
            })}
          <Grid item xs={12}>
            <Activity messages={activities} />
          </Grid>
          <Grid item xs={12}>
            <TextField id="message" label="message" />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={sendMessage}>
              <Typography>Send</Typography>
            </Button>
          </Grid>
        </Grid>
        <Grid item sm={8}>
          <Link to="/">
            <Button
              id="logout-btn"
              variant="contained"
              onClick={logout}
              className={classes.logoutbtn}
            >
              Logout
            </Button>
          </Link>
          <div>
            {currentProblem && (
              <div>
                <Grid item sm={12}>
                  <Typography variant="h3">
                    {currentProblem.questionName}
                  </Typography>
                </Grid>
                <Grid item sm={12}>
                  <br />
                </Grid>
                <Grid item sm={12}>
                  <div
                    className={classes.textStyle}
                    dangerouslySetInnerHTML={{
                      __html: currentProblem.questionDiv,
                    }}
                  />
                </Grid>
                <Grid item sm={12}>
                  <br />
                </Grid>
                <Typography variant="h5" className={classes.textStyle}>
                  Input Format
                </Typography>
                <Grid item sm={12}>
                  <div
                    className={classes.textStyle}
                    dangerouslySetInnerHTML={{
                      __html: currentProblem.questionInputTypeDiv,
                    }}
                  />
                </Grid>
                <Grid item sm={12}>
                  <br />
                </Grid>
                <Typography variant="h5" className={classes.textStyle}>
                  Output Format
                </Typography>
                <Grid item sm={12}>
                  <div
                    className={classes.textStyle}
                    dangerouslySetInnerHTML={{
                      __html: currentProblem.questionOutputTypeDiv,
                    }}
                  />
                </Grid>
                <Grid item sm={12}>
                  <br />
                </Grid>
                <Typography variant="h5" className={classes.textStyle}>
                  Sample Test Cases
                </Typography>
                {currentProblem.questionSampleTestCases &&
                  currentProblem.questionSampleTestCases.map((testCase) => {
                    return (
                      // <div>
                      <Grid item container className={classes.textStyle}>
                        <Grid item sm={6}>
                          <Typography
                            variant="h6"
                            className={classes.textStyle}
                          >
                            Input {counter}:
                          </Typography>
                          {
                            <div
                              dangerouslySetInnerHTML={{
                                __html: testCase.input,
                              }}
                            />
                          }
                        </Grid>
                        <Grid item sm={6}>
                          <Typography
                            variant="h6"
                            className={classes.textStyle}
                          >
                            Output {counter++}:
                          </Typography>
                          {
                            <div
                              dangerouslySetInnerHTML={{
                                __html: testCase.output,
                              }}
                            />
                          }
                        </Grid>
                        <Grid item sm={12}>
                          <br />
                        </Grid>
                      </Grid>
                      // </div>
                    );
                  })}
              </div>
            )}
            {/* <Editor /> */}
          </div>
          <Grid
            container
            item
            direction="row"
            justify="flex-end"
            alignItems="center"
          >
            <Editor />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default Contest;
