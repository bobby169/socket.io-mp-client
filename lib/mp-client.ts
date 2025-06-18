import { Socket, io as originalIo, ManagerOptions, SocketOptions } from "socket.io-client";
import { MPEngineSocket } from "./mp-engine";
import { Manager } from "socket.io-client";

// 扩展 Manager 以使用小程序引擎
class MPManager extends Manager {
  constructor(uri: string, opts: Partial<ManagerOptions> = {}) {
    super(uri, opts);
    // 强制使用 websocket
    this.opts.transports = ["websocket"];
  }

  protected engine(opts: any): any {
    return new MPEngineSocket(opts);
  }
}

// 小程序版本的 io 函数
export function io(uri: string, opts?: Partial<ManagerOptions & SocketOptions>): Socket;
export function io(opts?: Partial<ManagerOptions & SocketOptions>): Socket;
export function io(uri?: any, opts?: any): Socket {
  if (typeof uri === "object") {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  // 创建小程序专用的 Manager
  const manager = new MPManager(uri, opts);
  return manager.socket("/", opts);
}

// 导出其他必要的类型和函数
export { Socket, Manager, MPManager };
export * from "socket.io-client";
