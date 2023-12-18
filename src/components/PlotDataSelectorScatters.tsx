import { Grid, TextField } from '@mui/material';

const PlotDataSelectorScatters = () => {

  return (
    <div>
      <Grid container spacing={5}>
        <Grid item xs={4}>
          <TextField
            label="X Data"
            defaultValue="Voltage"
            variant="standard"
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Y Data"
            defaultValue="Current"
            variant="standard"
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Y Axis"
            defaultValue="Y1"
            variant="standard"
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default PlotDataSelectorScatters;
