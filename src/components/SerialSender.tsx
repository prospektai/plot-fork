import { Button, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useState } from 'react';
import { ModeInputs }  from './Mode/ModeInputs';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { buildSerialCommand } from './Mode/Modes';
import { Start, Stop } from '@mui/icons-material';

type Props = {
  running: boolean,
  setRunning: React.Dispatch<React.SetStateAction<boolean>>,
  sender: (arg: string) => void
};

const SerialSender = (props: Props) => {
  const [mode, setMode] = useState('cv');
  
  const handleModeChange = (event: SelectChangeEvent<HTMLInputElement>) => {
    setMode(event.target.value as string);
  };

  const onRun = (data: FieldValues) => {
    console.log(buildSerialCommand(mode, data));
    props.setRunning(true);
    props.sender(buildSerialCommand(mode, data));
  };  

  const onStop = () => {
    console.log('stop');
    props.sender('stop');

    props.setRunning(false);
  }

  const methods = useForm({mode: "onSubmit"});

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onRun)}>
        <Grid container spacing={2} mt={2} mb={2} pl={"10px"}>
          <FormControl>
            <InputLabel id="mode-select-input--label">Mode</InputLabel>
            <Select
              labelId="mode-select-input--label"
              id="mode-select-input"
              value={mode as ""}
              disabled={props.running}
              label="Mode"
              onChange={handleModeChange}
            >
              <MenuItem value={'cv'}>Cyclic voltametry</MenuItem>
              <MenuItem value={'dpv'}>Differential pulse voltametry</MenuItem>
              <MenuItem value={'pv'}>Pulse voltametry</MenuItem>
            </Select>
          </FormControl>

          <ModeInputs key={mode} mode={mode} running={props.running} />
        </Grid>
        <Grid item>
          {props.running ?
            <Button key={'form-control-stop'} variant="contained" onClick={onStop} color="warning" startIcon={<Stop />}>
              Stop
            </Button>
              :
            <Button key={'form-control-run'} variant="contained" type='submit' color="custom_gray" startIcon={<Start />}>
              Run
            </Button>
          }
        </Grid>
      </form>
    </FormProvider>
  );
};

export { SerialSender };
