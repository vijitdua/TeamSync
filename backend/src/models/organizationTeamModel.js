import {sequelize} from "../config/database.js";
import {DataTypes} from "sequelize";

const organizationTeamModel = sequelize.define("organizationTeamModel", {
    /*
        Automatically filled data fields
     */

    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    /*
        Required fields, where some must be automatically generated and others can be manually provided or automatically filled if not specified.
     */
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },

    teamLead: {
        type: DataTypes.ARRAY(DataTypes.UUID), // UUID from organizationMemberModel members that is / are team lead(s)
        allowNull: false,
    },

    // Date when team was created, defaults to current date if not provided
    foundationDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Sets the default value to the current date if not provided
        allowNull: false,
    },

    /*
        Optional Fields
     */

    teamLogo: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },

    description: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
    },

    discordId: {
        type: DataTypes.BIGINT, // Discord ROLE ID example 1247135999168090112
        allowNull: true, // Optional field
    },

    // Any other data that the organization using this app might want to add themselves. Public portion
    customDataPublic: {
        type: DataTypes.JSON, // Stores a JSON object
        allowNull: true,      // Optional field
    },

    // Any other data that the organization using this app might want to add themselves. Private portion
    customDataPrivate: {
        type: DataTypes.JSON, // Stores a JSON object
        allowNull: true,      // Optional field
    },

    // Date when team was deleted / archived
    deletionDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },

});


// Create table if not exists
organizationTeamModel.sync();

export default organizationTeamModel;