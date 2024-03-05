import { useState } from 'react';

import { PlotArea } from './PlotArea/PlotArea';

import { PlotData } from '../types/global';
import { Grid } from '@mui/material';

type ButtonPosType = {
  [label: string]: number;
};

type Props = {
  dct: PlotData[][];
  // labels: string[];
};

const PlotCollection = ({ dct }: Props) => {
  const [plotIdx] = useState([0, 1, 2, 3, 4, 5]);
  const [labels,] = 
    useState<string[]>(['Current1', 'Current2', 'Current3', 'Current4', 'Current5', 'Current6']);
  const [buttonPos, setButtonPos] = useState<ButtonPosType>({'Current1': 0});

  const handleDrag = (key: number) => {
    return (pos: { x: number; y: number }) => {
      const b = Object.assign({}, buttonPos);
      b[key] = pos.y;
      setButtonPos(b);
    };
  };
  
  let xOff = 80;
  let yRoof = 120;

  return (
    <div>
      <Grid id='mainPlotGrid' container spacing={10}>
        {
        plotIdx.map((idx, _) => {
          if(_ === 3){
            yRoof += (window.innerHeight - yRoof) / 2 - 10;
            xOff = -160;
          }else if(_ > 0){
            xOff += (window.innerWidth - 270) / 3
          }

          // console.log(xOff, yRoof);
          return (
            <Grid key={idx} item>
              <PlotArea 
                plotData={dct[_]}
                title={labels[_]} 
                labels={labels} 
                position={{ x: xOff, y: yRoof }} 
                onDrag={handleDrag(idx)} />
            </Grid>
          );
        }
        )}
      </Grid>
    </div>
  );
};

export { PlotCollection };
