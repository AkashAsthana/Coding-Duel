import { React, useState } from "react";
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

function RegisterForm() {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        username: email,
        password: password,
      };
      const payload = JSON.stringify(data);

      // server is running on port 4000
      // send data to register route
      const response = await fetch("/register", {
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
      })
        .then((res) => res.json())
        .then((json) => json)
        .catch((err) => alert("Sorry, Cannot Register"));
      if (response)
        if (response.Registered) alert("Registration Complete.");
        else alert(response.msg);
    } catch (err) {
      alert("Sorry, cannot Register");
    }
  };

  return (
    <div>
      <Grid container item justify="center">
        <Typography variant="h4" component="h2">
          Register
        </Typography>
      </Grid>
      <Grid cotainer item>
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
              type="text"
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

export default RegisterForm;
