import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

export const discordGuildRoleModel = sequelize.define('discordGuildRoles', {
    discordID: {
        type: DataTypes.BIGINT,
        primaryKey: true,
    },
    roleName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    roleColor: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'discordGuildRoles',
});

discordGuildRoleModel.sync();