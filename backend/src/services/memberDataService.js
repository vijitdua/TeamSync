import {organizationMemberModel} from "../models/organizationMemberModel.js";
import multer from "multer";
import {v4 as uuidv4} from 'uuid';
import {join} from "path";
import {env} from "../config/env.js";
import {memberImageStorage} from "../config/multerStorage.js";

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
 * Retrieve a member by their ID. Returns different data based on authentication state
 *
 * @param {string} id - The ID of the member to retrieve (Required).
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @returns {Promise<Object>} - A promise that resolves to the member data if found.
 * @throws {Error} - Throws an error if the member cannot be found.
 */
export async function getMember(id, isAuthenticated = false) {
    try {

        // Define the base query options
        const queryOptions = {
            where: { id: id },
        };

        // If not authenticated, only include members who haven't left (leaveDate is null)
        if (!isAuthenticated) {
            queryOptions.where.leaveDate = null;
        }

        // Find the member based on query options
        const member = await organizationMemberModel.findOne(queryOptions);

        if (!member) {
            throw new Error(`Member with ID ${id} not found`);
        }

        if (!isAuthenticated) {
            // Exclude private data from member object when user is not authenticated
            const { customDataPrivate, notes, ...publicData } = member.dataValues;
            return publicData;
        }

        return member;
    } catch (error) {
        throw new Error(`Error retrieving member:\n${error}`);
    }
}

/**
 * Get a member's ID based on their Discord ID
 * @param {number} discordId - The Discord ID of the member to retrieve (Required).
 * @returns {Promise<string>} - A promise that resolves to the member ID if found.
 * @throws {Error} - Throws an error if the member cannot be found.
 */
export async function getMemberByDiscordId(discordId) {
    try {
        // Find the member by their discordId
        const member = await organizationMemberModel.findOne({
            where: { discordId: discordId },
            attributes: ['id'], // Only return the 'id' field
        });

        if (!member) {
            throw new Error(`Member with Discord ID ${discordId} not found`);
        }

        return member.id;
    } catch (error) {
        throw new Error(`Error retrieving member by Discord ID:\n${error}`);
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

/**
 * Handles the upload of member images using Multer.
 *
 * **Important:** When using `uploadMemberImage`, wrap its invocation inside a Promise in your controller function to ensure proper asynchronous handling. This prevents the parent function from mistakenly believing the file upload failed even if it was successful.
 *
 * **Example Usage in Controller:**
 *
 * ```javascript
 * export async function uploadMemberImageController(req, res) {
 *   try {
 *     await new Promise((resolve, reject) => {
 *       uploadMemberImage(req, res, (err) => {
 *         if (err) {
 *           reject(err);
 *         } else {
 *           resolve();
 *         }
 *       });
 *     });
 *
 *     if (!req.file) {
 *       throw new Error('No file uploaded');
 *     }
 *
 *     res.status(200).json({
 *       success: true,
 *       file: `/memberImage/${req.file.filename}`,
 *     });
 *   } catch (err) {
 *     if (res.headersSent) return;
 *     res.status(400).json({
 *       success: false,
 *       message: err.message,
 *     });
 *   }
 * }
 * ```
 *
 * **Posting Instructions:**
 *
 * 1. **HTTP Method:** `POST`
 * 2. **URL:** Set to the correct endpoint.
 * 3. **Body:** Use `form-data`.
 *    - Key: `image` (this is the field name that Multer expects)
 *    - Type: **File**
 *    - Value: Select the file you want to upload.
 *
 * **Programmatic Example (JavaScript Fetch API):**
 *
 * ```javascript
 * const formData = new FormData();
 * formData.append('image', fileInput.files[0]); // 'image' matches the field name
 *
 * fetch('http://localhost:3000/your-endpoint', {
 *   method: 'POST',
 *   body: formData,
 * })
 *   .then(response => response.json())
 *   .then(data => console.log(data))
 *   .catch(error => console.error('Error:', error));
 * ```
 *
 * **Note:** In this example, `fileInput` represents the file input field in a form.
 *
 * **Description:**
 *
 * `uploadMemberImage` configures Multer to handle image uploads, storing files in the `memberImage/` directory. Only files submitted under the field name `'image'` are accepted.
 *
 * @throws Error if the upload is unsuccessful.
 */
export const uploadMemberImage = multer({
    storage: memberImageStorage,
    fileFilter: (req, file, cb) => {
        // Only accept file if it’s in the 'image' field
        if (file.fieldname === 'image') {
            cb(null, true);
        } else {
            console.log(`Invalid field for file upload: ${file.fieldname}`);
            cb(new Error('Invalid file upload field'));
        }
    }
}).single('image');


export function getMemberImage(filename){
    return join(join(env.rootLocation, 'memberImage'),`${filename}`);
}