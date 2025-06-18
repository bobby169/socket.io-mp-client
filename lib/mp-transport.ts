import { Transport } from "engine.io-client";
import { MPWebSocket } from "./mp-socket";

export class MPWebSocketTransport extends Transport {
  private ws: MPWebSocket | null = null;

  get name(): string {
    return "websocket";
  }

  doOpen(): void {
    const uri = this.uri();
    const protocols = this.opts.protocols;
    const headers = this.opts.extraHeaders;

    try {
      this.ws = new MPWebSocket(uri, protocols, headers);
    } catch (err) {
      return this.emitReserved("error", err);
    }

    this.ws.onopen = () => {
      this.onOpen();
    };

    this.ws.onclose = (event) => {
      this.onClose({
        description: "websocket connection closed",
        context: event,
        type: "close"
      });
    };

    this.ws.onmessage = (event) => {
      this.onData(event.data);
    };

    this.ws.onerror = (event) => {
      this.onError("websocket error", event);
    };
  }

  write(packets: any[]): void {
    this.writable = false;

    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i];
      const lastPacket = i === packets.length - 1;

      this.doWrite(packet, lastPacket);
    }
  }

  private doWrite(packet: any, lastPacket: boolean): void {
    if (this.ws && this.ws.readyState === 1) {
      try {
        this.ws.send(packet);
      } catch (err) {
        return this.onError("websocket error", err);
      }

      if (lastPacket) {
        // fake drain
        setTimeout(() => {
          this.writable = true;
          this.emitReserved("drain");
        }, 0);
      }
    }
  }

  doClose(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  uri(): string {
    let uri = this.opts.secure ? "wss://" : "ws://";
    const port = this.opts.port;

    uri += this.opts.hostname;

    if (port && ((this.opts.secure && Number(port) !== 443) || (!this.opts.secure && Number(port) !== 80))) {
      uri += ":" + port;
    }

    uri += this.opts.path;

    if (this.opts.query) {
      uri += "?" + this.opts.query;
    }

    return uri;
  }
}
