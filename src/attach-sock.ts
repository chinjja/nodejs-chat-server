import ws from 'ws';

export interface AttachSockMap {
    [key: string]: AttachSock;
}

export interface AttachSock {
    (sock: ws): void;
}