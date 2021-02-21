import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
const useStyle = makeStyles({
  style: {
    marginTop: "2rem",
  },
});
function GotoLogin() {
  const classes = useStyle();
  return (
    <Link to="/">
      <Button variant="contained" color="primary" className={classes.style}>
        Login
      </Button>
    </Link>
  );
}

export default GotoLogin;
