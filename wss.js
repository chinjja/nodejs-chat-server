const Room = require('./model')
const express = require('express')
const url = require('url')
const cookieParser = require('cookie-parser')
const WebSocketServer = require('ws').Server

Room.sync()
.then(() => {
    console.log('db ready');
})
.catch(() => {
    console.log('db not ready');
});

const app = express()
app.use(express.json())
app.use(cookieParser())
app.get('/rooms/:id', (req, res) => {
    console.log('get ' + req.url)
    get_room(res, req.params.id)
})
app.get('/rooms', (req, res) => {
    console.log('get ' + req.url)
    let query = url.parse(req.url, true).query
    get_room(res, query.id)
})

async function get_room(res, id) {
    try {
        if(id) {
            const result = await Room.findOne({where: {id: id}});
            res.json(result.toJSON());
        } else {
            const result = await Room.findAll();
            const array = []
            result.forEach(it => {array.push(it.toJSON())});
            res.json(array);
        }
    } catch(error) {
        res.status(400).json(error);
    }
}

app.post('/rooms', async (req, res) => {
    console.log('post ' + req.url)
   
    const title = req.body.title;
    if(!title) {
        res.status(400).json('require title in body')
        return
    }
    const room = await Room.create({title: title});
    res.json(room.toJSON());
    broadcast({
        type: 'updated-rooms',
        method: 'post',
        data: room.toJSON()
    })
})

app.put('/rooms/:id', async (req, res) => {
    console.log('put ' + req.url)

    try {
        const id = +req.body.id;
        const title = req.body.title;
        if(title) {
            const room = await Room.findOne({
                where: {id: id}
            });
            room.title = title;
            await room.save();
            res.json(room.toJSON());
            broadcast({
                type: 'updated-rooms',
                method: 'put',
                data: room.toJSON()
            });
        } else {
            res.status(400).json('require title');
        }
    } catch(error) {
        res.status(400).json(error);
    }
})
app.delete('/rooms/:id', (req, res) => {
    console.log('delete ' + req.url)
    console.log(req.body)
    delete_room(res, [req.params.id])
})
app.delete('/rooms', (req, res) => {
    console.log('delete ' + req.url)
    console.log(req.body)
    let query = url.parse(req.url, true).query
    if(is_empty(req.body)) {
        delete_room(res, [query.id])
    } else {
        delete_room(res, req.body)
    }
})

async function delete_room(res, ids) {
    if(ids) {
        const t = await Room.sequelize.transaction();
        try {
            for(let id of ids) {
                await Room.destroy({
                    where: {id: id}
                });
            }
            t.commit();
            res.json({});
            broadcast({
                type: 'updated-rooms',
                method: 'delete',
                data: ids
            });
        } catch(error) {
            t.rollback();
            res.status(400).json(error);
        }
    } else {
        res.status(400).json('require id');
    }
}

function broadcast(obj) {
    let json = JSON.stringify(obj)
    room_sockets.forEach((ws)=>ws.send(json))
}

function is_empty(obj) {
    return Object.keys(obj).length === 0
}

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