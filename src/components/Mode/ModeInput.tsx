import { Grid, InputAdornment, TextField } from "@mui/material";
import { ModeInputProps } from "../../types/Mode";
import { Controller } from "react-hook-form";

interface Props extends ModeInputProps {
  running: boolean
}

const ModeInput = (props: Props) => {

  return (
    <Grid item>
      <Controller
        name={props.label}
        rules={{
          required: true,
          min: props.valueRange.start,
          max: props.valueRange.end
        }}
        shouldUnregister={true}
        defaultValue={props.defaultValue}
        render={({field, fieldState}) => (
          <TextField 
            sx={{ width: '200px' }} 
            size="small"
            label={props.label} 
            value={field.value}
            disabled={props.running}
            type="number"
            onChange={field.onChange} 
            error={fieldState.error ? true : false}
            // helperText={fieldState.error ? fieldState.error.message : undefined}
            variant="standard"
            InputProps={{
              endAdornment: <InputAdornment position="end">{props.valueRange.start}-{props.valueRange.end} {props.unit}</InputAdornment>
            }} />
        )}
      />
    </Grid>
  );
}

export { ModeInput }