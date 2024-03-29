const express = require('express');
const User = require('../models/users');
const router = express.Router();

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
        const user = await User.create({email: email, password: password});
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

module.exports = router;