import Page1 from "./Pages/Page1";
import Page2 from "./Pages/Page2";
import Page3 from "./Pages/Page3";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import ProtectedRoute from "./Routes/ProtectedRoute";
import SimpleRoute from "./Routes/SimpleRoute";

function Navigator(props) {
  console.log("in Navigator : ", props);
  return (
    <Router>
      <Switch>
        <SimpleRoute path="/" exact component={Page1} />
        <ProtectedRoute path="/ready" exact component={Page2} />
        <ProtectedRoute path="/contest" exact component={Page3} />
      </Switch>
    </Router>
  );
}

export default Navigator;
