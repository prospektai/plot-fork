import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useState } from 'react';

type Props = {
  onChange: (val: string) => void;
  defaultBaud: string;
};

const options: string[] = [
  'raw_hid',
  '1200',
  '2400',
  '4800',
  '9600',
  '19200',
  '38400',
  '57600',
  '115200',
  '230400',
  '460800',
  '921600',
];

const BaudrateSelector = (props: Props) => {
  const [baud, setBaud] = useState(props.defaultBaud);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setBaud(event.target.value);
    props.onChange(event.target.value);
  };

  return (
    <FormControl variant="standard">
      <InputLabel id="label">Baudrate</InputLabel>
      <Select labelId="label" value={baud} onChange={handleChange}>
        {options.map((option, index) => (
          <MenuItem value={option} key={index}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export { BaudrateSelector };
