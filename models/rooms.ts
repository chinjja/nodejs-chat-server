import {Model, DataTypes } from 'sequelize';
import sequelize from './share';

class Room extends Model {
    id: number;
    title: string;
}

Room.init({
    title: DataTypes.TEXT
}, {sequelize});

Room.sync();

export = Room;