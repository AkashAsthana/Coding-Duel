import React, { Component, useState, useEffect } from "react";
import { Route } from "react-router-dom";
import methods from "../methods";
import GotoLogin from "../Components/GotoLogin";

function ProtectedRoute({ component: Component, ...rest }) {
  const [refferrer, setRefferrer] = useState(false);
  useEffect(async () => {
    try {
      const response = await methods.check();
      setRefferrer(response);
    } catch (err) {
      alert(err);
    }
  }, []);
  return (
    <Route
      {...rest}
      render={(props) =>
        refferrer == true ? <Component {...props} /> : <GotoLogin />
      }
    />
  );
}

export default ProtectedRoute;
