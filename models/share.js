const {Sequelize} = require('sequelize');
const sequelize = new Sequelize('sqlite:temp/db.sqlite', {
    logging: false
});

module.exports = sequelize;