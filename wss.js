const express = require('express')
const url = require('url')
const cookieParser = require('cookie-parser')
const WebSocketServer = require('ws').Server

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/rooms', require('./routes/rooms'));

let wss = new WebSocketServer({server: app.listen(8888)})
let room_sockets = new Set()

wss.on('connection', (ws, request) => {
    console.log('websocket ' + request.url)
    let urlParse = url.parse(request.url, true)
    console.log(urlParse.path)
    switch(urlParse.path) {
        case '/rooms':
            room_sockets.add(ws)
            break
    }
    ws.onmessage = (e) => {
        console.log(e.data)
        let req = JSON.parse(e.data)
        let res = {
            request: req
        }
        switch(req.type) {
            
        }
    }
    ws.onclose = (e) => {
        room_sockets.delete(ws)
        console.log('close code: ' + e.code + ', reason: ' + e.reason)
    }
    ws.onerror = (e) => {
        console.log(e.error)
    }
})
wss.on('listening', () => {
    console.log('listening')
})
wss.on('error', (error) => {
    console.log('error: ' + error)
})