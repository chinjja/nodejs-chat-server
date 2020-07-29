const express = require('express')
const url = require('url')
const cookieParser = require('cookie-parser')
const WebSocketServer = require('ws').Server
const roomRouter = require('./routes/rooms');
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/rooms', roomRouter);

const wss = new WebSocketServer({server: app.listen(8888)});

const sockRouter = {
    '/rooms': roomRouter
}

wss.on('connection', (ws, request) => {
    console.log('websocket ' + request.url);
    const path = url.parse(request.url, true).path;
    if(sockRouter[path]) {
        sockRouter[path].websock(ws);
    }
})
wss.on('listening', () => {
    console.log('listening')
})