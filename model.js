const {Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite:hello.sqlite', {
    logging: false
});

class Room extends Model {}

Room.init({
    title: DataTypes.TEXT
}, {sequelize});

module.exports = Room;