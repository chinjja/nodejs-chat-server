const {Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require('./share');

class Room extends Model {}

Room.init({
    title: DataTypes.TEXT
}, {sequelize});

Room.sync();

module.exports = Room;