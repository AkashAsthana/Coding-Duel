import LoginForm from "../Components/Login";
import RegisterForm from "../Components/Register";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    margin: "20px 10px 0px 100px",
  },
});

function Page1() {
  const classes = useStyles();

  return (
    <div className="App">
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid item container xs={8}>
        </Grid>
        <Grid item container xs={4}>
          <Grid item container xs={12} className={classes.root}>
            <LoginForm />
          </Grid>
          <Grid item container xs={12} className={classes.root}>
            <RegisterForm />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default Page1;
