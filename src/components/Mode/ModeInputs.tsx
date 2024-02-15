import { ModeInputProps } from "../../types/Mode";
import { ModeInput } from "./ModeInput";
import { getModeInputProps } from "./Modes";

type Props = {
  mode: string,
  running: boolean
};

const ModeInputs = (props: Props) => {
  
  if(!props) throw Error("No mode specified");
  
  const modeInputsProps: Array<ModeInputProps> = getModeInputProps(props.mode);

  return (
    <>
      {modeInputsProps.map((modeInputProps, index) => {
        return <ModeInput key={index} running={props.running} {...modeInputProps} />;
      })}
    </>
  );
}

export { ModeInputs }