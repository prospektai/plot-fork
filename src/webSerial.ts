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
    return this._connected && this.writable !== null;
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
      console.log('open serial port');
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
    if (this.writable === null) {
      console.info('Serial write is unavailable');
      console.info('Attempting to wait for serial write...');
      const attemptCount = 3;

      for(let i = 0; i < attemptCount; i++){  
          await new Promise(resolve => setTimeout(resolve, 1000));
          let out = `Timeout #${i + 1}`;

          if(this.writable === null){
            out += ' failed';
            console.log(out);
          }else{
            out += ' succeeded';
            console.log(out);
            break;
          }
      }

      if(this.writable === null){
        console.error(`Made ${attemptCount} attempts, failed to get serial write handle`)
        return;
      }
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
