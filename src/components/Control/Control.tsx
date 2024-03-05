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
  updatePlotData: (newData: { x: number; y: number }, shouldAddNew: boolean, id: number, plotDataIndex: number) => void;
  clearPlotData: () => void;
};

const HelpTooltip = styled(Tooltip)(() => ({
  tooltip: {
    fontSize: '15px',
    whiteSpace: 'pre-line',
    maxWidth: '500px',
  },
}));

// DRY, TODO: merge ref and state of app plotData into one source of truth

const Control = ({ clearPlotData, updatePlotData }: Props) => {
  const [com, setCom] = useState<WebUsbComInterface | null>(null);
  const [baudrate, setBaudrate] = useState('9600');
  const [connected, setConnected] = useState(false);

  // Is running command
  const [running, setRunning] = useState(false);

  const plotDataIndex = useRef(0);
  const hashtagInLine = useRef(true);
  const addNewMeasurement = useRef(false);
  const streamData = useRef<string[]>([]);
  const plotData = useRef<PlotData[][]>(Array.from({length: 6}, () => [{
    x: [],
    y: [],
    name: `1`,
    type: 'scatter',
    mode: 'lines',
  }] as PlotData[]));

  const getConnectBtnName = () => {
    if (!connected) {
      return 'Open';
    } else {
      return 'Close';
    }
  };

  const evaluateStreamLine = (line: string) => {
    if (line.includes('#JOB DONE')) {
      console.log("JOB DONE SIGNAL RECEIVED");
      setRunning(false);
    }

    if (line.includes('#E(V), I(uA)')) {
      hashtagInLine.current = false;
      // searchForBEGIN.current = true;
    }

    if (line.includes('#MEASUREMENT BEGIN')) {
      addNewMeasurement.current = true;

      // console.log('Initial if case');
    }

    if (line.includes('#MEASUREMENT END')) {
      // debugger;
      addNewMeasurement.current = true;
    }
  }

  const dataReceiveHandler = (msg: Uint8Array) => {
    // Pre-condition: 
    // msg is a Uint8Array containing the data fragment received
    // from serial input.
    // Post-condition:
    // The received message has been fully processed;
    // This means that:
    //    1. No further predicates including the parameter msg: Uint8Array
    //       are evaluated. I.e. the parameter data has been "absorbed" into
    //       all relevant component states in the system, 
    //       after which msg is discarded.
    // 
    // The function works in two main stages
    //    1. Decode (split) parameter msg into elements Ai, i := |msg.split('\n')|
    //       For each Ai: 
    //          1.1. Set flags altering Ai data flow
    //          1.2. Save data to current stream ref
    //    2. Conditional state transition section
    // 
    // The data flow and conditional logic can be described as follows:
    //    1. Flow control flags are fetched from streamData.current[lastLineId], 
    //       streamData.current[lastLineId] := self + msg;
    //       These flags 
    //    2. Iff msg does not contain newline separator, 
    //       streamData.current[lastLineId] := self + msg;
    //    3. Iff msg does contain newline separator,
    //       line is evaluated (as a newline indicates EOL)  
    
    const receivedLine = new TextDecoder().decode(msg).replaceAll('\r', '');

    let checkIfAdd = false;
    let lastLineId = streamData.current.length - 1;

    // Set data flow flags
    if(lastLineId > 0){
      evaluateStreamLine(streamData.current[lastLineId]);
    }

    if (lastLineId === -1) {
      // First line in the stream
      streamData.current = [receivedLine];
      evaluateStreamLine(streamData.current[0]);
    } else if (receivedLine.includes('\n')) {
      // Received line contains end of last line and start
      // of new line
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
          // Handle first line (should usually be only one line)
          const lastLine = streamData.current[lastLineId];
          const replaceLine = lastLine + splitLine;

          streamData.current[lastLineId] = replaceLine;
          
          evaluateStreamLine(streamData.current[lastLineId]);
          return;
        }

        if (splitLine[0] === '#') {
          streamData.current = [...streamData.current, splitLine];

          evaluateStreamLine(streamData.current[streamData.current.length - 1]);
          return;
        }

        if (splitLine !== '' && hashtagInLine.current) {
          lastLineId = streamData.current.length - 1;
          const lastLine = streamData.current[lastLineId];
          const replaceLine = lastLine + splitLine;
          streamData.current[lastLineId] = replaceLine;
          
          evaluateStreamLine(streamData.current[lastLineId]);
          return;
        }

        if (splitLine !== '' && !hashtagInLine.current) {
          streamData.current = [...streamData.current, splitLine];

          evaluateStreamLine(streamData.current[streamData.current.length - 1]);
          return;
        }
      });


    } else {
      // Last line was cut-off, more to come
      
      const lastLine = streamData.current[lastLineId];
      const replaceLine = lastLine + receivedLine;
      streamData.current[lastLineId] = replaceLine;

      evaluateStreamLine(streamData.current[lastLineId]);
    }

    if (checkIfAdd && !streamData.current[streamData.current.length - 2].includes('#') && !streamData.current[lastLineId].includes('BEGIN')) {
      // This gets run only if line contained newline

      const bunchUpFlag = /.{2,}oltage/;
      const currLine = streamData.current[lastLineId]
      let unBunched = [];

      // @use debug
      // if(streamData.current[lastLineId].includes('DONE')){
      //   console.log(streamData.current);
      //   debugger;
      // }

      if(bunchUpFlag.test(currLine)){
        unBunched = currLine.split(/(?=Voltage:)/);

        unBunched.forEach((line) => {
          addNewPoints(line);
        });
      }else{
        addNewPoints(streamData.current[lastLineId]);
      }
    }
  };

  const addNewPoints = (currStreamData: string) => {
    const splitMeasurementData = currStreamData.split(', ');
      let voltageData: number = 0;
      let currentData: number = 0;

      // eslint-disable-next-line prefer-const
      let newDataPoints: { x: number; y: number; }[] = [];

      splitMeasurementData.forEach((measurement) => {

        const splitMeasurement = measurement.split(': ');

        if (splitMeasurement[0].includes('Voltage')) {
          voltageData = parseFloat(splitMeasurement[1]);
        }else if (splitMeasurement[0].includes('Current')) {
          currentData = parseFloat(splitMeasurement[1]);
          newDataPoints.push({
            x: voltageData,
            y: currentData
          });

          // if(splitMeasurement[1].includes('Voltage')){
          //   // bunch up (should not happen)
          //   throw new Error("bunch up exists");
          // }
        }
      });

      // if(plotData.current[0][plotDataIndex.current].x.length > 206){
      //   debugger;
      // }

      if(plotData.current[0][0].x.length === 0){
        // ensure writing to first element
        addNewMeasurement.current = false;
      }

      if (addNewMeasurement.current) {

        plotDataIndex.current++;
        addNewMeasurement.current = false;
        // note: newDataPoints can (should not) be random length 

        newDataPoints.forEach((el, id) => {

          plotData.current[id][plotDataIndex.current] = {
            x: [el.x],
            y: [el.y],
            name: `${plotDataIndex.current + 1}`,
            type: 'scatter',
            mode: 'lines',
          };

          updatePlotData(
            {
              x: el.x,
              y: el.y,
            },
            true,
            id,
            plotDataIndex.current
          );
        });
      } else {

        // console.log(plotDataIndex.current);
        newDataPoints.forEach((el, id) => {

          // if(plotData.current[id][plotDataIndex.current] === undefined) debugger;

          plotData.current[id][plotDataIndex.current].x.push(voltageData);
          plotData.current[id][plotDataIndex.current].y.push(currentData);

          updatePlotData(
            {
              x: el.x,
              y: el.y,
            },
            false,
            id,
            plotDataIndex.current
          );
        });
      }
    // console.log(Object.values(plotData.current[0]), Object.values(plotData.current[4]));
  }

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
    plotData.current = Array.from({length: 6}, () => [{
      x: [],
      y: [],
      name: `1`,
      type: 'scatter',
      mode: 'lines',
    }] as PlotData[]);

    // Local state
    plotDataIndex.current = 0;
    addNewMeasurement.current = false;

    // Parent state
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
          <ControlInputs baudrate={baudrate} running={running} getConnectBtnName={getConnectBtnName} onClearClick={onClearClick} onConnectClick={onConnectClick} onSaveClick={onSaveClick} setBaudrate={setBaudrate} />
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
