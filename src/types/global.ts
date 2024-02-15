export type TraceDataY = {
  y: number[];
  name: string;
  mode?: string;
  x?: number[];
  yaxis?: string;
  x_name?: string;
  y_name?: string;
};

export type TraceData = {
  data: {
    y: number[];
    name: string;
    mode?: string;
  }[];
  layout:
    | {
        margin: {
          l: number;
          b: number;
          t: number;
        };
      }
    | Record<string, never>;
};

export type PlotYData = Array<number[]>;

export type PlotData = {
  x: number[];
  y: number[];
  // y: PlotYData;
  type: 'scatter';
  mode: 'lines';
  name: string;
};


export type OnDragType = {
  x: number;
  y: number;
};