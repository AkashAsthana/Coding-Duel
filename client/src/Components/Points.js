import React, { Component } from "react";

function Points() {
  return (
    <div>
      <p style={{ display: "inline-block" }} id="yourPoints">
        Your Points |
      </p>
      <p style={{ display: "inline-block" }} id="opponentPoints">
        {" "}
        | opponent Points
      </p>
    </div>
  );
}

export default Points;
