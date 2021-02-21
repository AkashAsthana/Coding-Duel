import React, { useState } from "react";
import { Input, TextField, Button, Grid, Typography } from "@material-ui/core";

function ProblemFilters(props) {
  const [minDiff, setMinDiff] = useState(800);
  const [maxDiff, setMaxDiff] = useState(3500);
  const [minIndex, setMinIndex] = useState("A");
  const [maxIndex, setMaxIndex] = useState("F");
  const [numProblems, setNumProblems] = useState(4);
  const [time, setTime] = useState("10");

  function onTimeChange(e) {
    setTime(e.target.value);
  }

  function onMinDifficultyChange(e) {
    setMinDiff(e.target.value);
  }
  function onMaxDifficultyChange(e) {
    setMaxDiff(e.target.value);
  }
  function onMinIndexChange(e) {
    setMinIndex(e.target.value);
  }
  function onMaxIndexChange(e) {
    setMaxIndex(e.target.value);
  }
  function onNumProblemsChange(e) {
    setNumProblems(e.target.value);
  }

  function onSubmit(e) {
    e.preventDefault();
    window.$time = time;
    const data = { minDiff, maxDiff, minIndex, maxIndex, numProblems };
    props.handleData(data);
  }

  return (
    <Grid item container spacing={2}>
      {/* rating goes from 800 to 3500 */}
      {/* Number of questions goes from 1 to 10 */}
      {/* Problem level goes from A to I */}

      <Grid item sm={12}>
        <Typography variant="h4">Filter</Typography>
      </Grid>
      <Grid item sm={12}>
        <TextField
          name="time"
          label="Time (min)"
          value={time}
          onChange={onTimeChange}
        />
      </Grid>
      <Grid item sm={12}>
        <TextField
          name="minDiff"
          label="Min difficulty"
          value={minDiff}
          onChange={onMinDifficultyChange}
        />
      </Grid>
      <Grid item sm={12}>
        <TextField
          name="maxDiff"
          label="Max difficulty"
          value={maxDiff}
          onChange={onMaxDifficultyChange}
        />
      </Grid>
      <Grid item sm={12}>
        <TextField
          name="minIndex"
          label="Min Index"
          value={minIndex}
          onChange={onMinIndexChange}
        />
      </Grid>
      <Grid item sm={12}>
        <TextField
          name="maxIndex"
          label="Max Index"
          value={maxIndex}
          onChange={onMaxIndexChange}
        />
      </Grid>
      <Grid item sm={12}>
        <TextField
          name="numProblems"
          label="No. of Problems"
          value={numProblems}
          onChange={onNumProblemsChange}
        />
      </Grid>
      <Grid item sm={12}>
        <Button onClick={onSubmit} variant="contained" color="primary">
          Apply
        </Button>
      </Grid>
    </Grid>
  );
}

export default ProblemFilters;
