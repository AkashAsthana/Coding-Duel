import React, { Component, useState, useEffect } from "react";
import { Redirect, Route } from "react-router-dom";
import methods from "../methods";

function SimpleRoute({ component: Component, ...rest }) {
  const [refferrer, setRefferrer] = useState(false);

  useEffect(async () => {
    try {
      const response = await methods.check().catch((err) => {
        alert("Cannot check...login or not server is not running");
      });
      setRefferrer(response);
    } catch (err) {
      alert(err);
    }
  }, []);

  return (
    <Route
      {...rest}
      render={(props) =>
        refferrer == true ? <Redirect to="/ready" /> : <Component {...props} />
      }
    />
  );
}

export default SimpleRoute;
