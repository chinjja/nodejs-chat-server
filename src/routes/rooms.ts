import express from 'express';
import url from 'url';
import Room from '../models/rooms';
import ws from 'websocket';
import { AttachSock } from '../attach-sock';

export const router = express.Router();

router.get('/:id', (req, res) => {
    console.log('get ' + req.url)
    get_room(res, +req.params.id)
})
router.get('/', (req, res) => {
    console.log('get ' + req.url)
    let query = url.parse(req.url, true).query
    get_room(res, +query.id!)
})

async function get_room(res: express.Response, id: number) {
    try {
        if(id) {
            const result = await Room.findOne({where: {id: id}});
            if(!result) {
                res.status(400).json("not found");
                return;
            }
            res.json(result.toJSON());
        } else {
            const result = await Room.findAll();
            const array: object[] = [];
            result.forEach(it => {array.push(it.toJSON())});
            res.json(array);
        }
    } catch(error) {
        res.status(400).json(error);
    }
}

router.post('/', async (req, res) => {
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

router.put('/:id', async (req, res) => {
    console.log('put ' + req.url)

    try {
        const id = +req.params.id;
        const title = req.body.title;
        if(title) {
            let room = await Room.findOne({
                where: {id: id}
            });
            if(!room) {
                res.status(400).json('not found');
                return;
            }
            room.title = title;
            room = await room.save();
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
router.delete('/:id', (req, res) => {
    console.log('delete ' + req.url)
    console.log(req.body)
    delete_room(res, [+req.params.id])
})
router.delete('/', (req, res) => {
    console.log('delete ' + req.url)
    console.log(req.body)
    delete_room(res, req.body);
})

async function delete_room(res: express.Response, ids: number[]) {
    if(ids) {
        const t = await Room.sequelize!.transaction({
            autocommit: false,
        });
        try {
            for(let id of ids) {
                await Room.destroy({
                    where: {id: id},
                    transaction: t,
                });
            }
            await t.commit();
            res.json({});
            broadcast({
                type: 'updated-rooms',
                method: 'delete',
                data: ids
            });
        } catch(error) {
            await t.rollback();
            res.status(400).json(error);
        }
    } else {
        res.status(400).json('require id');
    }
}

function broadcast(obj: any) {
    let json = JSON.stringify(obj);
    wss?.broadcastUTF(json);
}

let wss: ws.server | undefined;

export const attach: AttachSock = (ws) => {
    wss = ws;
}