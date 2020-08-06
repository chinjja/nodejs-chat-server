import express from 'express';
import url from 'url';
import cookieParser from 'cookie-parser';
import ws from 'ws';
import * as attach from './attach-sock';
import * as rooms from './routes/rooms';
import * as users from './routes/users';
import * as index from './routes/index';
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/rooms', rooms.router);
app.use('/users', users.router);
app.use('/', index.router);

const wss = new ws.Server({server: app.listen(8888)});

const sockRouter: attach.AttachSockMap = {
    '/rooms': rooms.attach
}

wss.on('connection', (ws, request) => {
    console.log('websocket ' + request.url);
    if(!request.url) {
        ws.close();
        return;
    }

    const path = url.parse(request.url, true).path;
    if(path && sockRouter[path]) {
        sockRouter[path](ws);
    } else {
        ws.close();
    }
})
wss.on('listening', () => {
    console.log('listening')
})