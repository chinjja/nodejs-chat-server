const sqlite = require('sqlite3')
const express = require('express')
const url = require('url')
const WebSocketServer = require('ws').Server

const app = express()
app.use(express.json())
app.get('/rooms/:id', (req, res) => {
    console.log('get ' + req.url)
    get_room(res, req.params.id)
})
app.get('/rooms', (req, res) => {
    console.log('get ' + req.url)
    let query = url.parse(req.url, true).query
    get_room(res, query.id)
})

function get_room(res, id) {
    if(id) {
        db.get('select * from chat where id=?', [id], (err, row) => {
            res.status(err ? 400 : 200).json(err || row || {})
        })
    } else {
        db.all('select * from chat', (err, rows) => {
            res.status(err ? 400 : 200).json(err || rows || {})
        })
    }
}

app.post('/rooms', (req, res) => {
    console.log('post ' + req.url)
   
    if(!req.body.title) {
        res.status(400).json('require title in body')
        return
    }
    db.serialize(() => {
        db.run('insert into chat values(null, ?)', req.body.title || 'no title')
        .get('select * from chat where id = last_insert_rowid()', (err, row) => {
            if(err) {
                console.log(err)
                res.status(400).json(err)
            }
            else {
                res.status(201).json(row)
                broadcast({
                    type: 'updated-rooms',
                    method: 'post',
                    data: row
                })
            }
        })
    })
})

app.put('/rooms/:id', (req, res) => {
    console.log('put ' + req.url)

    if(req.body.title) {
        db.run('update chat set title=? where id=?', [req.body.title, req.params.id], (err) => {
            if(err) {
                console.log(err)
                res.status(400).json(err)
            }
            else {
                res.status(200).json({})
                broadcast({
                    type: 'updated-rooms',
                    method: 'put',
                    data: {
                        id: +req.params.id,
                        title: req.body.title
                    }
                })
            }
        })
    } else {
        res.status(400).json('require title')
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

function delete_room(res, ids) {
    if(ids) {
        db.serialize(() => {
            db.run('begin')
            let stmt = db.prepare('delete from chat where id=?')
            for(let i = 0; i < ids.length; i++) {
                stmt.run(ids[i])
            }
            stmt.finalize()
            db.run('commit', (err)=>{
                if(err) {
                    console.log(err)
                    res.status(400).json(err)
                }
                else {
                    res.status(200).json({})
                    broadcast({
                        type: 'updated-rooms',
                        method: 'delete',
                        data: ids
                    })
                }
            })    
        })
    } else {
        res.status(400).json('require id')
    }
}

function broadcast(obj) {
    let json = JSON.stringify(obj)
    room_sockets.forEach((ws)=>ws.send(json))
}

function is_empty(obj) {
    return Object.keys(obj).length === 0
}

let db = new sqlite.Database('./data/chat.db')
db.run('create table if not exists chat(id integer primary key, title text not null)')

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