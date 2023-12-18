import { Button, Grid } from '@mui/material';
import { BaudrateSelector } from '../BaudrateSelector';
import UsbIcon from '@mui/icons-material/Usb';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

type Props = {
  baudrate: string;
  setBaudrate: React.Dispatch<React.SetStateAction<string>>;
  onConnectClick: () => Promise<void>;
  getConnectBtnName: () => 'Open' | 'Close';
  onSaveClick: () => void;
  onClearClick: () => void;
};

const ControlInputs = (props: Props) => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={3}>
        <BaudrateSelector
          onChange={(val: string) => {
            props.setBaudrate(val);
          }}
          defaultBaud={props.baudrate}
        />
      </Grid>
      <Grid item xs={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            props.onConnectClick();
          }}
        >
          <UsbIcon /> {props.getConnectBtnName()}
        </Button>
      </Grid>
      <Grid item xs={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            props.onSaveClick();
          }}
        >
          <SaveIcon />
          SAVE
        </Button>
      </Grid>
      <Grid item xs={3}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            props.onClearClick();
          }}
        >
          <DeleteIcon />
          CLEAR
        </Button>
      </Grid>
    </Grid>
  );
};

export { ControlInputs };
