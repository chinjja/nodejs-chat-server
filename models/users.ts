import { Model, DataTypes } from "sequelize";
import sequelize from "./share";
class User extends Model {
    id: number;
    email: string;
    password: string;
}

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

export = User;