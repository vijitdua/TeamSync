import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

export const discordGuildMemberModel = sequelize.define('discordGuildMembers', {
    discordID: {
        type: DataTypes.BIGINT,
        primaryKey: true,
    },
    discordUsername: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    discordDisplayName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    discordProfilePictureUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    }
}, {
    tableName: 'discordGuildMembers',
});

discordGuildMemberModel.sync();
