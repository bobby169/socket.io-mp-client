export interface MPSocketTask {
  send(data: string | ArrayBuffer): void;
  close(code?: number, reason?: string): void;
  onOpen(callback: (res: any) => void): void;
  onMessage(callback: (res: { data: string | ArrayBuffer }) => void): void;
  onError(callback: (res: any) => void): void;
  onClose(callback: (res: { code: number; reason: string }) => void): void;
}

export interface MPWebSocketOptions {
  url: string;
  protocols?: string[];
  header?: Record<string, string>;
}

export class MPWebSocket {
  private socketTask: MPSocketTask | null = null;
  private url: string;
  private protocols?: string[];
  private headers?: Record<string, string>;

  public onopen: ((event: any) => void) | null = null;
  public onmessage: ((event: { data: string | ArrayBuffer }) => void) | null = null;
  public onerror: ((event: any) => void) | null = null;
  public onclose: ((event: { code: number; reason: string }) => void) | null = null;

  public readyState: number = 0; // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED

  constructor(url: string, protocols?: string[], headers?: Record<string, string>) {
    this.url = url;
    this.protocols = protocols;
    this.headers = headers;
    this.connect();
  }

  private connect(): void {
    if (typeof wx === 'undefined') {
      throw new Error('wx is not defined, please run in WeChat MiniProgram environment');
    }

    const options: MPWebSocketOptions = {
      url: this.url,
      protocols: this.protocols,
      header: this.headers
    };

    this.socketTask = wx.connectSocket(options);
    
    if (!this.socketTask) {
      throw new Error('Failed to create socket connection');
    }

    this.socketTask.onOpen((res) => {
      this.readyState = 1; // OPEN
      if (this.onopen) {
        this.onopen(res);
      }
    });

    this.socketTask.onMessage((res) => {
      if (this.onmessage) {
        this.onmessage({ data: res.data });
      }
    });

    this.socketTask.onError((res) => {
      this.readyState = 3; // CLOSED
      if (this.onerror) {
        this.onerror(res);
      }
    });

    this.socketTask.onClose((res) => {
      this.readyState = 3; // CLOSED
      if (this.onclose) {
        this.onclose({ code: res.code, reason: res.reason });
      }
    });
  }

  public send(data: string | ArrayBuffer): void {
    if (this.socketTask && this.readyState === 1) {
      this.socketTask.send(data);
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  public close(code?: number, reason?: string): void {
    if (this.socketTask) {
      this.readyState = 2; // CLOSING
      this.socketTask.close(code, reason);
    }
  }
}

// 全局声明，让 socket.io 使用小程序的 WebSocket
declare global {
  interface Window {
    WebSocket: typeof MPWebSocket;
  }
  
  var WebSocket: typeof MPWebSocket;
}

// 如果在小程序环境中，替换全局 WebSocket
if (typeof wx !== 'undefined' && typeof WebSocket === 'undefined') {
  (global as any).WebSocket = MPWebSocket;
}
