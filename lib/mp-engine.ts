import { Socket as EngineSocket } from "engine.io-client";
import { MPWebSocketTransport } from "./mp-transport";

export class MPEngineSocket extends EngineSocket {
  constructor(opts: any = {}) {
    // 强制使用 websocket 传输，因为小程序不支持 polling
    opts.transports = ["websocket"];
    opts.upgrade = false;
    
    super(opts);

    // 替换传输方式
    this.transports = ["websocket"];
    (this as any).createTransport = this.createMPTransport.bind(this);
  }

  private createMPTransport(name: string): MPWebSocketTransport {
    if (name === "websocket") {
      return new MPWebSocketTransport({
        ...this.opts,
        socket: this,
        hostname: this.opts.hostname,
        secure: this.opts.secure,
        port: this.opts.port,
        path: this.opts.path,
        query: this.opts.query
      });
    }
    throw new Error(`Transport ${name} not supported in MiniProgram`);
  }
}
