import { useState } from 'react';
import useInterval from 'use-interval';
import Plot from 'react-plotly.js';
import { Layout } from 'plotly.js';

import { PlotData, TraceData } from '../../types/global';

type Props = TraceData & {
  size: {
    width: string;
    height: string;
  };
  data: PlotData[];
};

const StreamPlot = ({ data, layout: propsLayout, size }: Props) => {
  const [revision, setRevision] = useState(0);
  const [dataLen, setDataLen] = useState(0);
  const [layout, setLayout] = useState<Partial<Layout>>({
    ...propsLayout,
    datarevision: revision,
    showlegend: true,
    legend: { x: 1, y: 0.5 },
    yaxis: { side: 'left' },
    yaxis2: { side: 'right', overlaying: 'y' },
    margin: { l: 30, b: 30, t: 30 },
    autosize: true,
  });

  useInterval(() => {
    if (data.length > 0 && data[data.length - 1].y.length !== dataLen) {
      const newRevision = revision + 1;
      setRevision(newRevision);
      setLayout({ ...layout, datarevision: newRevision });
      setDataLen(data[data.length - 1].y.length);
    }
  }, 60);

  return (
    <Plot
      data={data}
      layout={layout}
      style={{ width: size.width, height: size.height }}
      config={{ responsive: true }}
      revision={revision}
      onInitialized={(figure) => {
        setLayout(figure.layout);
      }}
      onUpdate={(figure) => {
        setLayout(figure.layout);
      }}
      useResizeHandler={true}
      onClick={(e) => {
        console.log('onClick', e);
        e.event.stopImmediatePropagation();
      }}
    />
  );
};

export { StreamPlot };
