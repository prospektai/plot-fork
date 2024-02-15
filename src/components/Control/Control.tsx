import { WebSerial } from '../../webSerial';
import { WebRawHID } from '../../webRawHID';
import { WebUsbComInterface } from '../../types/WebUsbComInterface';
import { useRef, useState } from 'react';
import { Grid, IconButton, Tooltip, styled } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import { ControlInputs } from './ControlInputs';
import { PlotData } from '../../types/global';
import { SerialSender } from '../SerialSender';

type Props = {
  updatePlotData: (newData: { x: number; y: number }, shouldAddNew: boolean) => void;
  clearPlotData: () => void;
};

const HelpTooltip = styled(Tooltip)(() => ({
  tooltip: {
    fontSize: '15px',
    whiteSpace: 'pre-line',
    maxWidth: '500px',
  },
}));

const Control = ({ clearPlotData, updatePlotData }: Props) => {
  const [com, setCom] = useState<WebUsbComInterface | null>(null);
  const [baudrate, setBaudrate] = useState('9600');
  const [connected, setConnected] = useState(false);

  // Is running command
  const [running, setRunning] = useState(false);

  const plotDataIndex = useRef(0);
  const hashtagInLine = useRef(true);
  const searchForBEGIN = useRef(true);
  const streamData = useRef<string[]>([]);
  const plotData = useRef<PlotData[]>([]);

  const getConnectBtnName = () => {
    if (!connected) {
      return 'Open';
    } else {
      return 'Close';
    }
  };

  const dataReceiveHandler = (msg: Uint8Array) => {
    // TODO: rewrite this piece of shit to handle multiple plots at once
    // god help me
    const receivedLine = new TextDecoder().decode(msg).replaceAll('\r', '');

    let checkIfAdd = false;
    let lastLineId = streamData.current.length - 1;

    if (streamData.current.length !== 0 && 
      (receivedLine.includes('#JOB DONE') || streamData.current[lastLineId].includes('#JOB DONE'))) {
      console.log("JOB DONE SIGNAL RECEIVED");
      setRunning(false);
      // return;
    }

    if (streamData.current.length !== 0 && streamData.current[lastLineId].includes('#E(V), I(uA)')) {
      hashtagInLine.current = false;
      searchForBEGIN.current = true;
    }

    if (streamData.current.length !== 0 && streamData.current[lastLineId].includes('BEGIN') && searchForBEGIN.current) {
      plotDataIndex.current++;
      searchForBEGIN.current = false;
    }

    if (streamData.current.length === 0) {
      streamData.current = [receivedLine];
    } else if (receivedLine.includes('\n')) {
      checkIfAdd = true;
      const splitReceivedLine = receivedLine.split('\n');
      const splitReceivedLineLastIndex = splitReceivedLine.length - 1;

      splitReceivedLine.forEach((splitLine, index) => {
        if (streamData.current[lastLineId].includes('#E(V), I(uA)') || splitLine.includes('#E(V), I(uA)')) {
          hashtagInLine.current = false;
        }

        if (index === 0 && splitLine === '') {
          return;
        }

        if (index !== splitReceivedLineLastIndex && splitLine === '') {
          return;
        }

        if (index === splitReceivedLineLastIndex && splitLine === '') {
          streamData.current = [...streamData.current, ''];
          return;
        }

        if (index === 0) {
          const lastLine = streamData.current[lastLineId];
          const replaceLine = lastLine + splitLine;
          streamData.current[lastLineId] = replaceLine;
          return;
        }

        if (splitLine[0] === '#') {
          streamData.current = [...streamData.current, splitLine];
          return;
        }

        if (splitLine !== '' && hashtagInLine.current) {
          lastLineId = streamData.current.length - 1;
          const lastLine = streamData.current[lastLineId];
          const replaceLine = lastLine + splitLine;
          streamData.current[lastLineId] = replaceLine;
          return;
        }

        if (splitLine !== '' && !hashtagInLine.current) {
          streamData.current = [...streamData.current, splitLine];
          return;
        }
      });
    } else {
      const lastLine = streamData.current[lastLineId];
      const replaceLine = lastLine + receivedLine;
      streamData.current[lastLineId] = replaceLine;
    }

    if (checkIfAdd && streamData.current.length > 2 && !streamData.current[streamData.current.length - 2].includes('#') && !streamData.current[lastLineId].includes('BEGIN')) {
      const splitMeasurementData = streamData.current[lastLineId].split(', ');
      let voltageData: number = 0;
      let currentData: number = 0;

      splitMeasurementData.forEach((measurement) => {
        const splitMeasurement = measurement.split(': ');
        if (splitMeasurement[0].includes('Voltage')) {
          voltageData = parseFloat(splitMeasurement[1]);
        }

        if (splitMeasurement[0].includes('Current')) {
          currentData = parseFloat(splitMeasurement[1]);
        }
      });

      if (plotData.current.length === 0 || plotData.current.length === plotDataIndex.current) {
        plotData.current[plotDataIndex.current] = {
          x: [voltageData],
          y: [currentData],
          name: `Measurement nr. ${plotDataIndex.current + 1}: Voltage - Current`,
          type: 'scatter',
          mode: 'lines',
        };
        updatePlotData(
          {
            x: voltageData,
            y: currentData,
          },
          true,
        );
      } else {
        plotData.current[plotDataIndex.current].x.push(voltageData);
        plotData.current[plotDataIndex.current].y.push(currentData);
        updatePlotData(
          {
            x: voltageData,
            y: currentData,
          },
          false,
        );
      }
    }
  };

  const onConnectClick = async () => {
    if (com?.connected) {
      await com.close();
      setCom(com);
    } else {
      const newCom = baudrate === 'raw_hid' ? new WebRawHID() : new WebSerial();

      setCom(newCom);

      newCom.setCloseCallback(() => {
        setConnected(false);
      });

      newCom.setReceiveCallback((msg: Uint8Array) => {
        dataReceiveHandler(msg);
      });

      await newCom.open(
        () => {
          setConnected(true);
        },
        { baudrate: Number(baudrate) },
      );
    }
  };

  const onClearClick = () => {
    streamData.current = [];
    plotData.current = [];
    clearPlotData();
  };

  const onSaveClick = () => {
    let wereColumnsIncluded = false;

    const endOfMeasurementStrings = ['#', 'END'];
    const commentsWithCommaStrings = ['#', ','];
    const measurementLineStrings = ['Current', 'Voltage'];

    const csv = streamData.current
      .map((streamLine) => {
        const isEndOfMeasurement = endOfMeasurementStrings.every((substring) => streamLine.includes(substring));
        const isCommentsWithComma = commentsWithCommaStrings.every((substring) => streamLine.includes(substring));
        const isMeasurementLine = measurementLineStrings.some((substring) => streamLine.includes(substring)) && !streamLine.includes('#');

        if (isEndOfMeasurement) {
          // Reset for next measurement
          wereColumnsIncluded = false;
        }

        if (isCommentsWithComma) {
          // Prevent commas in comments from seperating content
          return `"${streamLine}"`;
        }

        if (isMeasurementLine && !wereColumnsIncluded) {
          // Since no columns are present, create columns and add data below
          wereColumnsIncluded = true;

          const seperateMeasurements = streamLine.split(', ');
          let header = '';
          let data = '';

          seperateMeasurements.forEach((measurement) => {
            const splitColumnsAndValues = measurement.split(': ');
            header = header.length === 0 ? splitColumnsAndValues[0] : `${header}, ${splitColumnsAndValues[0]}`;
            data = data.length === 0 ? splitColumnsAndValues[1] : `${data}, ${splitColumnsAndValues[1]}`;
          });

          return `${header}\n${data}`;
        }

        if (isMeasurementLine && wereColumnsIncluded) {
          // Parse data and add it
          const seperateMeasurements = streamLine.split(', ');
          let data = '';

          seperateMeasurements.forEach((measurement) => {
            const splitColumnsAndValues = measurement.split(': ');
            data = data.length === 0 ? splitColumnsAndValues[1] : `${data}, ${splitColumnsAndValues[1]}`;
          });

          return `${data}`;
        }

        // Simply add the comment line
        return streamLine;
      })
      .join('\n');

    const date = new Date(Date.now());

    const pad = (time: number) => time.toString().padStart(2, '0');

    const fileName = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.csv`;

    const fileLink = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = fileLink;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // useEffect(() => {
  //   console.log(running);
  // }, [running])

  return (
    <div>
      <Grid style={{ width: '650px' }} container spacing={1}>
        <Grid item xs={10}>
          <ControlInputs baudrate={baudrate} getConnectBtnName={getConnectBtnName} onClearClick={onClearClick} onConnectClick={onConnectClick} onSaveClick={onSaveClick} setBaudrate={setBaudrate} />
        </Grid>
        <Grid item xs={1}>
          <HelpTooltip
            title={
              'This app plot data received through a serial port.\nAll plot panels are interactive, resizable, and movable.\n\nData format:\n<label1>:<data1>, <label2>:<data2>, ...\n<data1>,<data2>, ...'
            }
          >
            <IconButton>
              <HelpIcon />
            </IconButton>
          </HelpTooltip>
        </Grid>
      </Grid>
      <SerialSender
        running={running}
        setRunning={setRunning}
        sender={async (value: string) => {
          await com?.writeString(value.concat('\n'));
        }}
      />
    </div>
  );
};

export { Control };
