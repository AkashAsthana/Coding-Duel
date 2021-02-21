import React from "react";
import ReactDOM from "react-dom";
import "./style.css";
import App from "./App";
// this will be the username
window.$name = "";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
