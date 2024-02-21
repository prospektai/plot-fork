import { ModeInputProps, ModeInputsProps } from "../../types/Mode";

type ModesDict = { [key: string]: ModeInputsProps };

const Modes: ModesDict = {
  "cv": {
    commandHeader: "CyclicVoltametry",
    inputsProps: [
      {
        label: "Start voltage",
        unit: 'V',
        valueRange: {start: -1.6, end: 1.6},
        defaultValue: -0.6
      },
      {
        label: "Stop voltage",
        unit: 'V',
        valueRange: {start: -1.6, end: 1.6},
        defaultValue: 1.6
      },
      {
        label: "Voltage step",
        unit: 'V',
        valueRange: {start: 0.001, end: 0.1},
        defaultValue: 0.007
      },
      {
        label: "Scan rate",
        unit: 'V/s',
        valueRange: {start: 0.001, end: 1},
        defaultValue: 0.1
      },
      {
        label: "Number of cycles",
        unit: '#',
        valueRange: {start: 1, end: 255},
        defaultValue: 40
      }]
  },
  "dpv": {
    commandHeader: "DiffPulseVoltametry",
    inputsProps: [
      {
        label: "Start voltage",
        unit: 'V',
        valueRange: {start: -1.6, end: 1.6},
        defaultValue: -1
      },
      {
        label: "Stop voltage",
        unit: 'V',
        valueRange: {start: -1.6, end: 1.6},
        defaultValue: 0.5
      },
      {
        label: "Voltage step",
        unit: 'V',
        valueRange: {start: 0.001, end: 0.1},
        defaultValue: 0.007
      },
      {
        label: "Scan rate",
        unit: 'V/s',
        valueRange: {start: 0.001, end: 1},
        defaultValue: 0.1
      },
      {
        label: "Pulse voltage",
        unit: 'V',
        valueRange: {start: 0.001, end: 0.050},
        defaultValue: 0.0484
      }]
  },
  "pv": {
    commandHeader: "PulseVoltametry",
    inputsProps: [
      {
        label: "Pulse high",
        unit: 'V',
        valueRange: {start: 0, end: 1.6},
        defaultValue: 1
      },
      {
        label: "High duration",
        unit: 's',
        valueRange: {start: 0.001, end: 10},
        defaultValue: 0.1
      },
      {
        label: "Pulse low",
        unit: 'V',
        valueRange: {start: 0, end: 1.6},
        defaultValue: 0.1
      },
      {
        label: "Low duration",
        unit: 's',
        valueRange: {start: 0.001, end: 10},
        defaultValue: 0.1
      },
      {
        label: "Number of cycles",
        unit: '#',
        valueRange: {start: 1, end: 255},
        defaultValue: 20
      }]
  }
}

// Helpers
const getModeInputProps = (mode: string) => {
  return Modes[mode].inputsProps as Array<ModeInputProps>;
};

const buildSerialCommand = (mode: string, values: Record<string, string>) => {
  const modeOptions = Modes[mode];
  const commandHeader = modeOptions.commandHeader;

  let command = commandHeader;
  modeOptions.inputsProps.forEach((prop) => {
    const val = values[prop.label];

    command += ` "${val}"`;
  });

  return command;
}

export { Modes, getModeInputProps, buildSerialCommand }