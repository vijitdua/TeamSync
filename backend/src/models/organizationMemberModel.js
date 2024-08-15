import {sequelize} from "../config/database.js";
import {DataTypes} from "sequelize";

export const organizationMemberModel = sequelize.define('organizationMemberModel', {
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

    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },

    position: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },

    // Date when user joined the organization, defaults to current date if not provided
    joinDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Sets the default value to the current date if not provided
        allowNull: false,
    },

    /*
        Optional Fields
     */

    profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },

    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true, // Optional field
        validate: {
            is: /^\+?[1-9]\d{1,14}$/, // Basic validation for phone numbers (E.164 format)
        },
    },

    email: {
        type: DataTypes.STRING,
        allowNull: true, // Optional field
        validate: {
            isEmail: true, // Validates the string as an email address
        },
    },

    discordId: {
        type: DataTypes.BIGINT, // Discord ID's example 933604018951974924
        allowNull: true, // Optional field
    },

    // Date employee left / was removed from organization. Existence of date means user is no longer a part of organization. Client applications must implement this appropriately.
    leaveDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },

    // Teams of the organization that member is in
    teams: {
        type: DataTypes.ARRAY(DataTypes.UUID), // Store an array of UUIDs referencing team IDs
        allowNull: true, // This field is optional
        defaultValue: [], // Default to an empty array
    },

    // Any notes that admins might want to add to the user
    notes: {
        type: DataTypes.TEXT, // Allows for multiline strings
        allowNull: true,      // Optional field
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


}, {
    tableName: 'organizationMembers',

});

// Create table if it doesn't exist
organizationMemberModel.sync();