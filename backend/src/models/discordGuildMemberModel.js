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
    },
    // Teams of the organization that member is in
    discordRoles: {
        type: DataTypes.ARRAY(DataTypes.BIGINT),
        allowNull: true,
        defaultValue: [], // Default to an empty array
    },
}, {
    tableName: 'discordGuildMembers',
});

discordGuildMemberModel.sync({alter: true});
