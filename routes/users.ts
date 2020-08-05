import * as express from 'express';
import User from '../models/users';
const router = express.Router();
import * as crypt from '../crypt-utils';

router.get('/:id', async (req, res) => {
    console.log('get ' + req.url)
    try {
        const user = await User.findOne({where: {id: req.params.id}});
        if(user) {
            res.json(user.toJSON());
        } else {
            res.json({});
        }
    } catch(error) {
        res.json(error);
    }
});

router.post('/', async (req, res) => {
    console.log('post ' + req.url)
    try {
        const email = req.body.email;
        const password = req.body.password;
        if(!email || !password) {
            res.json('require email and password in body')
            return;
        }
        const encoded = await crypt.hash(password);
        const user = await User.create({email: email, password: encoded});
        res.json(user.toJSON());
    } catch(error) {
        res.json(error);
    }
});

router.delete('/:id', async (req, res) => {
    console.log('delete ' + req.url);
    try {
        await User.destroy({where: {id: req.params.id}});
        res.json({});
    } catch(error) {
        res.json(error);
    }
});

export default router;