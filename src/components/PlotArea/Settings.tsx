import { MouseEvent, useState } from 'react';
import { IconButton, Popover } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

import { PlotDataSelector } from '../PlotDataSelector';

import { PlotData, TraceData } from '../../types/global';

type AnchorType = (EventTarget & HTMLButtonElement) | null;

type Props = {
  plotData: PlotData[];
  labels: string[];
  trace: TraceData;
  setTrace: (value: React.SetStateAction<TraceData>) => void;
};

const Settings = ({ plotData, labels, trace, setTrace }: Props) => {
  const [anchorEl, setAnchorEl] = useState<AnchorType>(null);
  const handleClick = (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <IconButton aria-describedby={id} onClick={handleClick}>
        <SettingsIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <PlotDataSelector
          data={plotData}
          labels={labels}
          onUpdate={(data: TraceData) => {
            setTrace(Object.assign({}, data));
          }}
          plots={trace.data}
        />
      </Popover>
    </>
  );
};

export { Settings };
