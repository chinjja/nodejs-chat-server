import * as express from 'express';
import User from '../models/users';
import jwt from 'jsonwebtoken';
import secretObj from '../config/jwt';
const router = express.Router();

router.get('/login', async (req, res) => {
    if(!req.body.email || !req.body.password) {
        res.send('require email and password');
        return;
    }

    const user = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    if(user && user.password === req.body.password) {
        jwt.sign({
            id: user.id,
            email: user.email
        }, secretObj.secret, {expiresIn: '5m'}, (err, token) => {
            if(err) {
                res.json(err);
            } else {
                res.cookie('token', token);
                res.json({
                    token: token
                });
            }
        });
    } else {
        res.send('not match email or password');
    }
});

export default router;