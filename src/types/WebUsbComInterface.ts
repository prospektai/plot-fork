export type ReceiveHandler = ((msg: Uint8Array) => void) | null;
export type CloseHandler = (() => void) | null;
export type ErrorHandler = ((e: Error) => void) | null;
export type onConnect = (() => void) | null;

export type WebUsbComInterface = {
  connected: boolean;
  setReceiveCallback: (receiveHandler: ReceiveHandler) => void;
  setCloseCallback: (closeHandler: CloseHandler) => void;
  setErrorCallback?: (errorHandler: ErrorHandler) => void;
  open: (onConnect: onConnect, param: { baudrate: number }) => Promise<void>;
  close: () => Promise<void>;
  writeString: (msg: string) => Promise<void>;
  write: (msg: Uint8Array) => Promise<void>;
};
