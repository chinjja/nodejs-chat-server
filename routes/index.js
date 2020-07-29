const express = require('express');
const router = express.Router();
const User = require('../models/users');
const jwt = require('jsonwebtoken');
const secretObj = require('../config/jwt');
const crypt = require('../crypt-utils');

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
    const ok = await crypt.compare(req.body.password, user.password);
    if(ok) {
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

module.exports = router;