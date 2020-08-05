import { Sequelize } from "sequelize";
const sequelize = new Sequelize('sqlite:temp/db.sqlite', {
    logging: false
});

export = sequelize;