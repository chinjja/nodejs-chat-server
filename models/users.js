const {Model, DataTypes } = require('sequelize');
const sequelize = require('./share');

class User extends Model {}

User.init({
    email: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {sequelize});

User.sync();

module.exports = User;