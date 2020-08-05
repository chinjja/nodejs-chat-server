import express from 'express';
import url from 'url';
import cookieParser from 'cookie-parser';
import ws from 'ws';
import { AttachSock, AttachSockMap } from "./attach-sock";
import {router as roomRouter, attach as roomAttach} from './routes/rooms';
import userRouter from './routes/users';
import indexRouter from './routes/index';
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/rooms', roomRouter);
app.use('/users', userRouter);
app.use('/', indexRouter);

const wss = new ws.Server({server: app.listen(8888)});

const sockRouter: AttachSockMap = {
    '/rooms': roomAttach
}

wss.on('connection', (ws, request) => {
    console.log('websocket ' + request.url);
    const path = url.parse(request.url, true).path;
    if(sockRouter[path]) {
        sockRouter[path](ws);
    }
})
wss.on('listening', () => {
    console.log('listening')
})