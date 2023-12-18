/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ReceiveHandler,
  CloseHandler,
  onConnect,
  WebUsbComInterface,
} from './types/WebUsbComInterface';

class WebRawHID implements WebUsbComInterface {
  private receiveCallback: ReceiveHandler = null;
  private closeCallback: CloseHandler = null;

  private port: any | null = null;

  private _connected: boolean = false;
  get connected() {
    return this._connected;
  }

  setReceiveCallback(receiveHandler: ReceiveHandler) {
    this.receiveCallback = (e: any) => {
      if (receiveHandler) {
        receiveHandler(new Uint8Array(e.data.buffer).filter((x) => x != 0));
      }
    };
    this.port.addEventListener('inputreport', this.receiveCallback);
  }
  setCloseCallback(closeHandler: CloseHandler) {
    this.closeCallback = closeHandler;
  }

  async open(onConnect: onConnect, _: object) {
    const request = await navigator.hid.requestDevice({
      filters: [{ usagePage: 0xff31, usage: 0x74 }],
    });
    this.port = request[0];

    try {
      await this.port.open();
    } catch (e) {
      await this.port.close();
      return Promise.reject(e);
    }

    this._connected = true;

    if (onConnect) {
      onConnect();
    }

    console.log('open Raw HID port');
  }

  async writeString(_msg: string) {
    throw new Error('Not implemented');
  }

  async write(_msg: Uint8Array) {
    throw new Error('Not implemented');
  }

  async close() {
    if (this.closeCallback) {
      this.closeCallback();
    }

    if (this.port) {
      try {
        this.port.removeEventListener('inputreport', this.receiveCallback);
        await this.port.close();
        this.port = null;
        this._connected = false;
      } catch (e) {
        console.error(e);
      }
    }

    console.log('Raw HID port closed');
  }
}

export { WebRawHID };
