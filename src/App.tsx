import { useState } from 'react';
import { Control } from './components/Control/Control';
import { PlotCollection } from './components/PlotCollection';
import { PlotData } from './types/global';
import { ThemeProvider, Typography, alpha, createTheme, getContrastRatio } from '@mui/material';

import logo from "./logo.jpg";

if (!navigator.serial) {
  alert('Please use chrome or edge');
}

const grayBase = '#e0e0e0';
const grayMain = alpha(grayBase, 0.7);

const blackBase = '#000000de';
const blackMain = alpha(blackBase, 0.7);

const App = () => {

  const [plotData, setPlotData] = useState<PlotData[][]>(Array.from({length: 6}, () => [{
    x: [],
    y: [],
    name: `1`,
    type: 'scatter',
    mode: 'lines',
  }] as PlotData[]));
  // d1 - plot id
  // d2 - PlotData[] item

  const theme = createTheme({
    palette: {
      primary: {
        main: '#3f51b5',
      },
      secondary: {
        main: '#f50057',
      },
      custom_gray: {
        main: grayMain,
        light: alpha(grayBase, 0.5),
        dark: alpha(grayBase, 0.9),
        contrastText: getContrastRatio(grayMain, '#fff') > 4.5 ? '#fff' : '#111',
      },
      custom_black: {
        main: blackMain,
        light: alpha(blackBase, 0.5),
        dark: alpha(blackBase, 0.9),
        contrastText: getContrastRatio(blackMain, '#fff') > 4.5 ? '#fff' : '#111',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            minWidth: 130,
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            minWidth: 120,
            margin: 4,
          },
        },
      },
      MuiGrid: {
        styleOverrides: {
          root: {
            alignItems: 'center',
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          root: {
            minHeight: '100px',
          },
        },
      },
    },
  });

  const clearPlotData = () => { 
    setPlotData(Array.from({length: 6}, () => [{
      x: [],
      y: [],
      name: `1`,
      type: 'scatter',
      mode: 'lines',
    }] as PlotData[]));
  }

  const updatePlotDate = (newData: { x: number; y: number }, shouldAddNew: boolean, id: number = 0, plotDataIndex: number = 0) => {

    if (shouldAddNew) {
      setPlotData((prev) => {
        const next = [...prev];

        let mod_plot_data = next[id];

        mod_plot_data = [...mod_plot_data, {
          x: [newData.x],
          y: [newData.y],
          name: `${plotDataIndex + 1}`,
          type: 'scatter',
          mode: 'lines',
        }];

        next[id] = mod_plot_data;

        return [
          ...next
        ];
      });
    } else {
      setPlotData((prev) => {
        const next = [...prev];

        next[id][next[id].length - 1].x.push(newData.x);
        next[id][next[id].length - 1].y.push(newData.y);
        return [...next];
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <header>
        <img 
          style={{
            maxHeight: 50
          }}
          src={logo}/>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 'bold',
            marginBlockStart: '0.83em',
            marginBlockEnd: '0.83em',
          }}
        >
          Web Serial Plotter
        </Typography>
      </header>
      <Control clearPlotData={clearPlotData} updatePlotData={updatePlotDate} />
      <PlotCollection dct={plotData}/>
    </ThemeProvider>
  );
};

export default App;
