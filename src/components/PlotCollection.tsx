import { useEffect, useState } from 'react';

import { PlotArea } from './PlotArea/PlotArea';

import { PlotData } from '../types/global';

type ButtonPosType = {
  [label: string]: number;
};

type Props = {
  dct: PlotData[];
  labels: string[];
};

const PlotCollection = ({ dct, labels: propsLabels }: Props) => {
  const [plotIdx] = useState([0]);
  const [labels, setLabels] = useState<string[]>([]);
  const [buttonPos, setButtonPos] = useState<ButtonPosType>({ 0: 0 });

  useEffect(() => {
    setLabels(propsLabels);
  }, [propsLabels]);

  const handleDrag = (key: number) => {
    return (pos: { x: number; y: number }) => {
      const b = Object.assign({}, buttonPos);
      b[key] = pos.y;
      setButtonPos(b);
    };
  };

  return (
    <div>
      <div>
        {plotIdx.map((idx, _) => {
          return <PlotArea key={idx} plotData={dct} labels={labels} position={{ x: 0, y: Math.max(0, ...Object.values(buttonPos)) }} onDrag={handleDrag(idx)} />;
        })}
      </div>
    </div>
  );
};

export { PlotCollection };
