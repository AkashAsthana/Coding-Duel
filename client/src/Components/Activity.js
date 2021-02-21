import React, { Component, useState } from "react";
import {
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  scrollMenu: {
    overflowY: "auto",
    height: "200px",
    width: "auto",
    border: "2px solid black",
    margin: "1rem",
    borderRadius:"1rem"
  },
}));

function Activity(props) {
  console.log("Activity : ", props);
  const classes = useStyles();

  function generateListItem(msg) {
    return <ListItem>{msg}</ListItem>;
  }

  return (
    <div>
      <List className={classes.scrollMenu} id='textChat'>
        <ListItem alignItems="flex-start">
          <ListItemText primary="sent a message last " />
        </ListItem>
        {props.messages &&
          props.messages.map((message) => {
            return generateListItem(message);
          })}
      </List>
    </div>
  );
}
export default Activity;
