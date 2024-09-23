import {organizationMemberModel} from "../models/organizationMemberModel.js";
import multer from "multer";
import {v4 as uuidv4} from 'uuid';
import {join} from "path";
import {env} from "../config/env.js";

/**
 * Gets the userIDs of all members of the organization
 * @returns {Promise<string[]>} Array with userIDs of all user members
 */
export async function getAllMembers() {
    try {
        const data = await organizationMemberModel.findAll({attributes: ['id']});
        const memberIdArray = data.map(record => record.id);
        return memberIdArray;
    } catch (error) {
        throw new Error('Error fetching all members');
    }
}

/**
 * Retrieve a member by their ID.
 *
 * @param {string} id - The ID of the member to retrieve (Required).
 * @returns {Promise<Object>} - A promise that resolves to the member data if found.
 * @throws {Error} - Throws an error if the member cannot be found.
 */
export async function getMember(id) {
    try {
        // Find the member by ID and return the result
        const member = await organizationMemberModel.findByPk(id);
        if (!member) {
            throw new Error(`Member with ID ${id} not found`);
        }
        return member;
    } catch (error) {
        throw new Error(`Error retrieving member:\n${error}`);
    }
}

/**
 * Adds a new member to the organization
 * @param {Object} data Object containing User Data
 * @param {string} data.name Member name (Required)
 * @param {string} data.position Member position (Required)
 * @param {string} [data.joinDate] Member join date, automatically filled if null (Optional)
 * @param {string} [data.profilePicture] Member profile picture URL
 * @param {string} [data.phoneNumber] Member phone number
 * @param {string} [data.email] Member email
 * @param {number} [data.discordId] Member discord ID number
 * @param {array} [data.teams] UUID's of teams that member is present in
 * @param {string} [data.notes] Notes from administrator for team member
 * @param {Object} [data.customDataPublic] Custom attributes for publicly visible data for team member
 * @param {Object} [data.customDataPrivate] Custom attributes for private data for team member
 */
export async function addMember(data) {
    try {
        const newMember = await organizationMemberModel.create({
            name: data.name,
            position: data.position,
            joinDate: data.joinDate || undefined, // Automatically filled if null by sequalize model
            profilePicture: data.profilePicture || null,
            phoneNumber: data.phoneNumber || null,
            email: data.email || null,
            discordId: data.discordId || null,
            teams: data.teams || [],
            notes: data.notes || null,
            customDataPublic: data.customDataPublic || null,
            customDataPrivate: data.customDataPrivate || null,
        });
        return newMember;
    } catch (error) {
        throw new Error(`Error adding member:\n${error}`);
    }
}

/**
 * Updates the data of a member in the organization
 * @param {string} id ID of the member to update (Required)
 * @param {Object} data Object containing the fields to update (Required)
 * @param {string} [data.name] Member name
 * @param {string} [data.position] Member position
 * @param {string} [data.joinDate] Member join date
 * @param {string} [data.profilePicture] Member profile picture URL
 * @param {string} [data.phoneNumber] Member phone number
 * @param {string} [data.email] Member email
 * @param {number} [data.discordId] Member discord ID number
 * @param {array} [data.teams] UUID's of teams that member is present in
 * @param {string} [data.notes] Notes from administrator for team member
 * @param {Object} [data.customDataPublic] Custom attributes for publicly visible data for team member
 * @param {Object} [data.customDataPrivate] Custom attributes for private data for team member
 */
export async function updateMember(id, data) {
    try {
        const member = await organizationMemberModel.findByPk(id);
        if (!member) {
            throw new Error(`Member with ID ${id} not found`);
        }
        await member.update({
            name: data.name || member.name,
            position: data.position || member.position,
            joinDate: data.joinDate || member.joinDate,
            profilePicture: data.profilePicture || member.profilePicture,
            phoneNumber: data.phoneNumber || member.phoneNumber,
            email: data.email || member.email,
            discordId: data.discordId || member.discordId,
            teams: data.teams || member.teams,
            notes: data.notes || member.notes,
            customDataPublic: data.customDataPublic || member.customDataPublic,
            customDataPrivate: data.customDataPrivate || member.customDataPrivate,
        });

        return member;
    } catch (error) {
        throw new Error(`Error updating member:\n${error}`);
    }
}


/**
 * Soft delete a member by setting the leaveDate to the current date.
 *
 * @param {string} id - The ID of the member to be soft deleted (Required).
 * @returns {Object} - The updated member data with the leaveDate set.
 * @throws {Error} - Throws an error if the member cannot be found or updated.
 */
export async function deleteMember(id) {
    try {
        // Find the member by ID
        const member = await organizationMemberModel.findByPk(id);
        if (!member) {
            throw new Error(`Member with ID ${id} not found`);
        }

        // Update the leaveDate to the current date
        member.leaveDate = new Date();
        await member.save();

        // Return the updated member data
        return member;
    } catch (error) {
        throw new Error(`Error deleting member:\n${error}`);
    }
}

// Setup storage for memberImage
const memberImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'memberImage/'); // Upload to the 'memberImage' folder
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + file.originalname.slice(file.originalname.lastIndexOf('.'))); // Ensure unique filenames
    },
    limits: { fileSize: 10 * 1024 * 1024}, // 10mb upload limit
});

/**
 * usage example:
 * ```js
 * // Handle member image uploads
 * app.post('/upload/member', uploadMemberImage.single('memberImage'), (req, res) => {
 *   if (!req.file) {
 *     return res.status(400).send('No file uploaded.');
 *   }
 *   res.send({ message: 'File uploaded successfully', url: `/memberImage/${req.file.filename}` });
 * });
 * ```
 */
export const uploadMemberImage = multer({ storage: memberImageStorage });

export function getMemberImage(filename){
    return join(join(env.root_location, 'memberImage'),`${filename}`);
}