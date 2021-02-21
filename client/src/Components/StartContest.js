import React, { useEffect, useRef, useState } from "react";
import { Redirect, Link } from "react-router-dom";
import methods from "../methods";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ProblemFilters from "./ProblemFilters";
// var HOST = window.location.origin.replace(/^http/, 'ws')
// console.log(HOST)
var url="wss://codingduel.herokuapp.com";
// var url="ws://localhost:4000";
var connection;
var problems;
var time;

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
  },
  media: {
    height: 140,
  },
});
function StartContest() {
  const classes = useStyles();
  const [refferrer, setRefferrer] = useState(false);
  const [roomName, setRoomName] = useState();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => console.log("changed refferrer : ", refferrer), [refferrer]);

  useEffect(() => {
    try {
      connection = new WebSocket(url);
      connection.onopen = function () {
        console.log("open")
      };
      connection.onclose = function () {
        // Try to reconnect in 3 seconds
        setTimeout(function () {
          start(url);
        }, 3000);
      };
    } catch (err) {
      alert("Cannot connect to server");
    }
  }, []);

  function start(url) {
    console.log("attempting to reconnect...");
    connection = new WebSocket(url);
    connection.onclose = function () {
      // Try to reconnect in 3 seconds
      setTimeout(function () {
        start(url);
      }, 3000);
    };
  }

  // admin presses the call button
  function call() {
    window.$roomName = roomName;
    window.$time = 10;
    const data = {
      minDiff: 800,
      maxDiff: 3500,
      minIndex: "A",
      maxIndex: "F",
      numProblems: 4,
    };
    setIsAdmin(true);
    window.$roomName = roomName;
    try {
      console.log('username : ',window.$name)
      methods.goToVideoCall((e) => {
        window.$roomName = roomName;
        if (e == true) {
          setRefferrer(true);
        }
      }, roomName);
      connection.send(
        JSON.stringify({
          type: "create_room",
          roomName: window.$roomName,
          name: window.$name,
          filters: window.hasOwnProperty("$filters") ? window.$filters : null,
          time: window.$time,
        })
      );
      handleData(data);
    } catch (err) {
      console.log(err);
      alert("Please refresh and try again.");
    }
  }

  // 'other guy' presses the join button
  function join() {
    window.$roomName = roomName;
    try {
      console.log('username : ',window.$name);
      methods.joinVideoCall((e) => {
        if (e == true) {
          setRefferrer(true);
        }
      }, roomName);

      connection.send(
        JSON.stringify({
          type: "create_room",
          roomName: window.$roomName,
          name: window.$name,
          filters: window.hasOwnProperty("$filters") ? window.$filters : null,
          time: window.$time,
        })
      );
    } catch (err) {
      console.log(err);
      alert("Please refresh and try again");
    }
  }
  function handleRoomNameChange(e) {
    setRoomName(e.target.value);
  }

  async function handleData(data) {
    window.$filters = data;
    try{
      document.getElementById('ready-btn').disabled=true;
    }catch(err){
      console.log(err);
    }
    connection.send(
      JSON.stringify({
        type: "Apply_filter",
        roomName: window.$roomName,
        filters: window.$filters,
        time: window.$time,
      })
    );
    connection.onmessage = (message) => {
      if (message.data == "Applied!") { 
        alert("Applied!");
        try{
          document.getElementById('ready-btn').disabled=false;
        }catch(err){
          console.log(err);
        }
      }
    };
  }

  function logout() {
    methods.videoStop();
    localStorage.removeItem("jwtToken");
  }

  return refferrer === true ? (
    <Redirect to="contest" />
  ) : (
    <Grid container direction="column">
      <Grid item container>
        <Grid item sm={4}></Grid>
        <Grid item container sm={4}>
          <Grid container>
            <Grid item sm={8}>
              <TextField
                id="room-name"
                label="Room Name"
                onChange={handleRoomNameChange}
                required
              />
            </Grid>
            <Grid item sm={2}>
              <Button
                variant="contained"
                color="primary"
                name="startBtn"
                type="submit"
                onClick={call}
              >
                Start
              </Button>
            </Grid>
            <Grid item sm={2}>
              <Button
                variant="contained"
                color="primary"
                name="joinBtn"
                onClick={join}
              >
                Join
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item sm={4}>
          <Grid item sm={6}>
            <Typography className="wait">Waiting for opponent..</Typography>
          </Grid>
          <Grid item sm={6}>
            <Link to="/">
              <Button id="logout-btn" variant="contained" onClick={logout}>
                Logout
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Grid>
      <Grid item container>
        <Grid item container sm={6}></Grid>
        <Grid item container sm={6}>
          {isAdmin && <ProblemFilters handleData={handleData} />}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default StartContest;
