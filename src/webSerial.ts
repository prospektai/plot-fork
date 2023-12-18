import {
  ReceiveHandler,
  CloseHandler,
  ErrorHandler,
  onConnect,
  WebUsbComInterface,
} from './types/WebUsbComInterface';

class WebSerial implements WebUsbComInterface {
  private receiveCallback: ReceiveHandler = null;
  private closeCallback: CloseHandler = null;
  private errorCallback: ErrorHandler = null;

  private port: SerialPort | null = null;
  private writable: WritableStream | null = null;
  private reader: ReadableStreamDefaultReader | null = null;

  private _connected: boolean = false;

  get connected() {
    return this._connected;
  }

  constructor(
    private send_chunk: number = 64,
    private send_interval: number = 30,
  ) {}

  setReceiveCallback(receiveHandler: ReceiveHandler) {
    this.receiveCallback = receiveHandler;
  }
  setCloseCallback(closeHandler: CloseHandler) {
    this.closeCallback = closeHandler;
  }
  setErrorCallback(errorHandler: ErrorHandler) {
    this.errorCallback = errorHandler;
  }

  async open(onConnect: onConnect, param = { baudrate: 115200 }) {
    this.port = await navigator.serial.requestPort();

    try {
      await this.port.open({ baudRate: param.baudrate, bufferSize: 81920 });
    } catch (e) {
      await this.port.close();
      return Promise.reject(e);
    }

    this._connected = true;

    if (onConnect) {
      onConnect();
    }

    await this.startReadLoop();

    this.writable = this.port.writable;
    console.log('open serial port');
  }

  private async startReadLoop() {
    this.readLoop();
    await this.sleep(1000);
  }

  private async readLoop() {
    if (this.port == null) {
      console.error('failed to read from serial port');
      return;
    }

    try {
      this.reader = this.port.readable.getReader();
      for (;;) {
        const { done, value } = await this.reader.read();

        if (value) {
          if (this.receiveCallback) {
            this.receiveCallback(value);
          }
        }

        if (done) {
          console.log('Web serial read complete', done);
          if (this.reader) {
            this.reader.releaseLock();
          }

          break;
        }
      }
    } catch (e) {
      console.error(e);
      if (this.errorCallback) {
        if (e instanceof Error) {
          this.errorCallback(e);
        } else {
          this.errorCallback(new Error(e as string));
        }
      }

      await this.close();
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve: TimerHandler) => setTimeout(resolve, ms));
  }

  async writeString(msg: string) {
    await this.write(new TextEncoder().encode(msg));
  }

  async write(msg: Uint8Array) {
    if (this.writable == null) {
      console.error('Serial write is unavailable');
      return;
    }

    const writer = this.writable.getWriter();

    for (let index = 0; index < msg.length; index += this.send_chunk) {
      await writer.write(msg.slice(index, index + this.send_chunk));
      await this.sleep(this.send_interval);
    }

    writer.releaseLock();
  }

  async close() {
    if (this.reader) {
      try {
        await this.reader.cancel();
        this.reader.releaseLock();
      } catch (e) {
        console.error(e);
      } finally {
        this.reader = null;
      }
    }

    if (this.writable) {
      this.writable = null;
    }

    if (this.closeCallback) {
      this.closeCallback();
    }

    if (this.port) {
      try {
        await this.port.close();
        this.port = null;
        this._connected = false;
      } catch (e) {
        console.error(e);
      }
    }

    console.log('serial port closed');
  }
}

export { WebSerial };
