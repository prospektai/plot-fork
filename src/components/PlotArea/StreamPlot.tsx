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
    legend: { orientation: "v", xanchor: "right" },
    yaxis: { side: 'left' },
    yaxis2: { side: 'right', overlaying: 'y' },
    margin: { l: 40, b: 20, t: 20, r: 10 },
    autosize: true,
  });

  // useEffect(() => {
  //   console.log(data);
  // }, [])

  useInterval(() => {
    if (data && data.length > 0 && data[data.length - 1].y.length !== dataLen) {
      const newRevision = revision + 1;
      setRevision(newRevision);
      setLayout({ ...layout, datarevision: newRevision });
      setDataLen(data[data.length - 1].y.length);
    }
  }, 60);

  // useInterval(() => {
  //   if (data && data.length > 0 && data[data.length - 1].y.length !== dataLen) {
  //     console.log(data);
  //   }
  // }, 1500);

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
        e.event.stopImmediatePropagation();
      }}
    />
  );
};

export { StreamPlot };
