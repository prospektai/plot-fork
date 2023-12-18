import { FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useEffect, useState } from 'react';
import { TraceDataY } from '../types/global';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { dict: any };
  labels: string[];
  value: TraceDataY;
  onUpdate: (arg0: TraceDataY) => void;
};

const PlotDataSelectorLines = (props: Props) => {
  const [labels, setLabels] = useState(props.labels);
  const [trace, setTrace] = useState(props.value);

  useEffect(() => {
    setLabels(props.labels);
  }, [props.labels]);

  const handleChangeData = (e: SelectChangeEvent) => {
    trace.y = props.data.dict[e.target.value];
    delete trace.x;
    trace.name = e.target.value;
    setTrace(trace);
    props.onUpdate(trace);
  };

  const listupData = () => {
    return (
      <FormControl variant="standard">
        <InputLabel id="labelData">Y Data</InputLabel>
        <Select labelId={'labelData'} value={labels.includes(props.value.name) ? props.value.name : ''} onChange={handleChangeData}>
          {labels.map((label, idx) => {
            return (
              <MenuItem value={label} key={idx}>
                {label}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  };

  const handleChangeAxis = (e: SelectChangeEvent) => {
    trace.yaxis = e.target.value;
    delete trace.x;
    setTrace(trace);
    props.onUpdate(trace);
  };

  const listupAxis = () => {
    return (
      <FormControl variant="standard">
        <InputLabel id="axisData">Y Axis</InputLabel>
        <Select labelId="axisData" value={props.value.yaxis ?? 'y'} onChange={handleChangeAxis}>
          <MenuItem value="y">Y1</MenuItem>
          <MenuItem value="y2">Y2</MenuItem>
        </Select>
      </FormControl>
    );
  };

  return (
    <div>
      <Grid container spacing={5}>
        <Grid item xs={4}></Grid>
        <Grid item xs={4}>
          {listupData()}
        </Grid>
        <Grid item xs={4}>
          {listupAxis()}
        </Grid>
      </Grid>
    </div>
  );
};

export default PlotDataSelectorLines;
