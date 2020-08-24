import ws from 'websocket';

export interface AttachSockMap {
    [key: string]: AttachSock;
}

export interface AttachSock {
    (sock: ws.server): void;
}