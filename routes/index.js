const express = require('express');
const router = express.Router();
const User = require('../models/users');
const jwt = require('jsonwebtoken');
const secretObj = require('../config/jwt');

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
            email: 'chinjja@gmail.com'
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