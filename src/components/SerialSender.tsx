import { Button, Grid, TextField } from '@mui/material';
import { ChangeEvent, useState } from 'react';

type Props = {
  sender: (arg: string) => void;
};

const SerialSender = (props: Props) => {
  const [value, setValue] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleClick = () => {
    props.sender?.(value);
  };

  return (
    <Grid container>
      <Grid item>
        <TextField sx={{ width: '400px' }} label="Output text" onChange={handleChange} variant="standard" />
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={handleClick} color="custom_gray">
          Send
        </Button>
      </Grid>
    </Grid>
  );
};

export { SerialSender };
