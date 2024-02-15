export type ModeInputValueRange = {
  start: number,
  end: number
};

export type ModeInputProps = {
  label: string,
  unit: string,
  valueRange: ModeInputValueRange
  defaultValue: number
};

export type ModeInputsProps = {
  commandHeader: string,
  inputsProps: Array<ModeInputProps>
};