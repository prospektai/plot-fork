import { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { Grid, Typography } from '@mui/material';

import { StreamPlot } from './StreamPlot';
import { Settings } from './Settings';

import { PlotData, TraceData, OnDragType } from '../../types/global';

type Props = {
  plotData: PlotData[];
  position: {
    x: number;
    y: number;
  };
  onDrag: ({ x, y }: OnDragType) => void;
  labels: string[],
  title?: string
};

const PlotArea = ({ plotData, labels, position, onDrag, title }: Props) => {
  const [trace, setTrace] = useState<TraceData>({
    data: [],
    layout: {
      margin: {
        l: 30,
        b: 30,
        t: 30,
      },
    },
  });

  const [rnd, setRnd] = useState({
    height: (window.innerHeight - 140) / 2,
    width: (window.innerWidth - 30) / 3,
    x: position.x,
    y: position.y,
  });

  useEffect(() => {
    const updateWindowDimensions = () => {
      setRnd((prev) => {
        return {
          ...prev,
          height: (window.innerHeight - 140) / 2,
          width: (window.innerWidth - 30) / 3,
        };
      });
    };
  

    window.addEventListener('resize', updateWindowDimensions);

    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);

  // useInterval(() => {
  //   if (plotData && plotData.length > 0) {
  //     console.log(plotData);
  //   }
  // }, 2000);

  return (
    <Rnd
      position={{ x: rnd.x, y: rnd.y }}
      size={{ width: rnd.width, height: rnd.height }}
      style={{ border: 'solid 1px #ddd' }}
      minHeight={40}
      dragHandleClassName="dragHandle"
      onDragStop={(_e, d) => {
        setRnd({ ...rnd, x: d.x, y: d.y });
        onDrag({ x: 0, y: d.y + rnd.height });
      }}
      onResizeStop={(_e, _direction, ref, _delta, _position) => {
        setRnd({
          ...rnd,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
        onDrag({ x: 0, y: rnd.y + ref.offsetHeight });
      }}
    >
      <Grid container spacing={0} className="dragHandle" style={{ background: '#eee', justifyContent: 'flex-end' }}>
        <Grid item xs={6}>
          <Settings labels={labels} plotData={plotData} setTrace={setTrace} trace={trace} />
        </Grid>
        <Grid item xs={6}>
          <Typography component="h6">{title}</Typography>
        </Grid>
      </Grid>
      <StreamPlot
        data={plotData}
        layout={trace.layout}
        size={{
          width: `${rnd.width - 10}px`,
          height: `${rnd.height - 50}px`,
        }}
      />
    </Rnd>
  );
};

export { PlotArea };
