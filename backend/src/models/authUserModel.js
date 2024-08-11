import {DataTypes} from 'sequelize';
import {sequelize} from '../config/database.js';

export const authUserModel = sequelize.define('authUserModel', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'authUsers', // Explicitly define the table name here
});

// Create table if not exists
authUserModel.sync();

