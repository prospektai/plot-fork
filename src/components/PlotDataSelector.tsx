import { useState } from 'react';
import PlotDataSelectorScatters from './PlotDataSelectorScatters';
import { Grid, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PlotData, TraceData, TraceDataY } from '../types/global';

type Props = {
  data: PlotData;
  labels: string[];
  onUpdate: (arg0: TraceData) => void;
  plots: TraceDataY[];
};

const PlotDataSelector = (props: Props) => {
  const [plots, setPlots] = useState(props.plots);
  const [plotKeys, setPlotKeys] = useState(props.plots.length > 0 ? new Array(props.plots.length).fill(0).map((_, idx) => idx) : [0]);

  const plotSelector = (key: number) => {
    return (
      <Grid key={key} container spacing={3}>
        <Grid item xs={4}>
          <TextField
            label="Plot Type"
            defaultValue="Scatter"
            variant="standard"
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>
        <Grid item xs={7}>
          <PlotDataSelectorScatters />
        </Grid>
        <Grid item xs={1}>
          <IconButton
            color="secondary"
            onClick={() => {
              const newKeys = plotKeys.filter((x) => x != key);
              setPlotKeys(newKeys);
              const newPlots = newKeys.reduce<{ [key: number]: TraceDataY }>((prev, curr) => {
                prev[curr] = plots[curr];
                return prev;
              }, {});
              setPlots(Object.values(newPlots));

              props.onUpdate({
                data: Object.values(newPlots),
                layout: {},
              });
            }}
          >
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
    );
  };

  return (
    <div style={{ width: '700px', margin: '10px' }}>
      {plotKeys.map((k) => {
        return plotSelector(k);
      })}
    </div>
  );
};
export { PlotDataSelector };
