import * as express from 'express';
import SerialPort from 'serialport';

export const router = express.Router();

router.get('/', async (req, res) => {
    console.log('get ' + req.url)
    const list = await SerialPort.list();
    res.json(list);
});

router.put('/:port', async (req, res) => {
    console.log('put ' + req.url);
    const port = req.params.port;
    if(!port) {
        res.send('require port');
        return;
    }
    const data = req.body.data;
    if(!data) {
        res.send('require data');
        return;
    }

    const sp = new SerialPort(port, {
        baudRate: 9600
    }, (error) => {
        if(error) {
            console.log('port open error');
            res.send(`${port} open error`);
        } else {
            console.log('port opened')
            sp.write(data, (error, written) => {
                sp.close(()=>{
                    console.log('port closed ' + written);
                    res.json(error || "write success");
                });
            });
        }
    });
})