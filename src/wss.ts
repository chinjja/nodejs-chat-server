import express from 'express';
import cors from 'cors';
import url from 'url';
import cookieParser from 'cookie-parser';
import ws from 'websocket';
import * as attach from './attach-sock';
import * as rooms from './routes/rooms';
import * as users from './routes/users';
import * as index from './routes/index';
import * as ports from './routes/ports';
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/rooms', rooms.router);
app.use('/users', users.router);
app.use('/ports', ports.router);
app.use('/', index.router);

const wss = new ws.server({
    httpServer: app.listen(8888)
});

const sockRouter: attach.AttachSockMap = {
    '/rooms': rooms.attach
}

wss.on('request', (request) => {
    const path = url.parse(request.resource, true).path;
    if(path && sockRouter[path]) {
        request.accept();
        sockRouter[path](wss);
        console.log(`connected websocket server with ${request.resource} [${wss.connections.length}]`);
    } else {
        console.log(`rejected websocket server with ${request.resource}`);
        request.reject();
    }
});
wss.on('close', (_connection, code, reason) => {
    console.log(`closed connection with code=${code} reason=${reason} [${wss.connections.length}]`)
})