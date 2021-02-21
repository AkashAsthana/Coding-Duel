import React, { Component, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(() => ({
  aboutbtn: {
    marginLeft: "auto",
    marginRight: "2rem",
  },
}));

function Header() {
  const classes = useStyles();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h2">CodingDuel</Typography>
        <InfoIcon className={classes.aboutbtn} />
      </Toolbar>
    </AppBar>
  );
}
export default Header;
