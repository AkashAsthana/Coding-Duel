import { React, useState } from "react";
import loginMethod from "./loginMethods/loginUtils";
import { Redirect } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
  root: {
    margin: "20px 5px 20px 5px",
  },
});

function LoginForm() {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referrer, setReferrer] = useState(false);

  const onEmailChange = (e) => {
    setEmail(e.target.value);
    window.$name = e.target.value;
  };
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      loginMethod.authenticate(
        (status, msg) => {
          try {
            if (status) {
              setReferrer(true);
            } else {
              alert(msg);
            }
          } catch (err) {
            alert(err);
          }
        },
        email,
        password
      );
    } catch (err) {
      alert("Sorry, currently we cannot authenticate you");
    }
  };
  return referrer === true ? (
    <Redirect to="/ready" />
  ) : (
    <div>
      <Grid container item justify="center">
        <Typography variant="h4" component="h2">
          Login
        </Typography>
      </Grid>
      <Grid container item>
        <form onSubmit={onSubmit}>
          <Grid item container className={classes.root}>
            <TextField
              id="standard-name"
              variant="filled"
              type="text"
              name="email"
              label="Email"
              value={email}
              required
              onChange={onEmailChange}
            />
          </Grid>
          <Grid item container className={classes.root}>
            <TextField
              id="standard-name"
              variant="filled"
              type="password"
              name="password"
              label="Password"
              value={password}
              required
              onChange={onPasswordChange}
            />
          </Grid>
          <Grid item className={classes.root}>
            <Button color="primary" variant="contained" onClick={onSubmit}>
              {" "}
              Submit{" "}
            </Button>
          </Grid>
        </form>
      </Grid>
    </div>
  );
}

export default LoginForm;
