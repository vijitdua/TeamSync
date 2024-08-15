import {DataTypes} from 'sequelize';
import {sequelize} from '../config/database.js';


export const authUserModel = sequelize.define('authUserModel', {
    /*
        Automatically filled data fields
     */
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    /*
        Required fields, where some must be automatically generated and others can be manually provided or automatically filled if not specified.
     */
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
    tableName: 'authUsers',
});

// Create table if not exists
authUserModel.sync();

