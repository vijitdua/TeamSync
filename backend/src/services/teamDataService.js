import { organizationTeamModel } from "../models/organizationTeamModel.js";
import multer from "multer";
import { join } from "path";
import { env } from "../config/env.js";
import { teamImageStorage } from "../config/multerStorage.js";

/**
 * Gets the IDs of all teams in the organization
 * @returns {Promise<string[]>} Array with IDs of all teams
 */
export async function getAllTeams() {
    try {
        const data = await organizationTeamModel.findAll({ attributes: ['id'] });
        const teamIdArray = data.map(record => record.id);
        return teamIdArray;
    } catch (error) {
        throw new Error('Error fetching all teams');
    }
}

/**
 * Retrieve a team by its ID. Returns different data based on authentication state
 *
 * @param {string} id - The ID of the team to retrieve (Required).
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @returns {Promise<Object>} - A promise that resolves to the team data if found.
 * @throws {Error} - Throws an error if the team cannot be found.
 */
export async function getTeam(id, isAuthenticated = false) {
    try {
        // Define the base query options
        const queryOptions = {
            where: { id: id },
        };

        // If not authenticated, only include teams that are active (deletionDate is null)
        if (!isAuthenticated) {
            queryOptions.where.deletionDate = null;
        }

        // Find the team based on query options
        const team = await organizationTeamModel.findOne(queryOptions);

        if (!team) {
            throw new Error(`Team with ID ${id} not found`);
        }

        if (!isAuthenticated) {
            // Exclude private data from team object when user is not authenticated
            const { customDataPrivate, notes, ...publicData } = team.dataValues;
            return publicData;
        }

        return team;
    } catch (error) {
        throw new Error(`Error retrieving team:\n${error}`);
    }
}

/**
 * Get a team's ID based on its Discord role ID
 * @param {number} discordId - The Discord role ID of the team to retrieve (Required).
 * @returns {Promise<string>} - A promise that resolves to the team ID if found.
 * @throws {Error} - Throws an error if the team cannot be found.
 */
export async function getTeamByDiscordId(discordId) {
    try {
        // Find the team by its discordId
        const team = await organizationTeamModel.findOne({
            where: { discordId: discordId },
            attributes: ['id'], // Only return the 'id' field
        });

        if (!team) {
            throw new Error(`Team with Discord role ID ${discordId} not found`);
        }

        return team.id;
    } catch (error) {
        throw new Error(`Error retrieving team by Discord role ID:\n${error}`);
    }
}

/**
 * Adds a new team to the organization
 * @param {Object} data Object containing Team Data
 * @param {string} data.name Team name (Required)
 * @param {Array<string>} data.teamLead UUID(s) of team lead(s) (Required)
 * @param {string} [data.foundationDate] Team foundation date, automatically filled if null (Optional)
 * @param {string} [data.teamLogo] Team logo URL
 * @param {string} [data.description] Team description
 * @param {number} [data.discordId] Team discord role ID
 * @param {Object} [data.customDataPublic] Custom attributes for publicly visible data for team
 * @param {Object} [data.customDataPrivate] Custom attributes for private data for team
 */
export async function addTeam(data) {
    try {
        const newTeam = await organizationTeamModel.create({
            name: data.name,
            teamLead: data.teamLead,
            foundationDate: data.foundationDate || undefined,
            teamLogo: data.teamLogo || null,
            description: data.description || null,
            discordId: data.discordId || null,
            customDataPublic: data.customDataPublic || null,
            customDataPrivate: data.customDataPrivate || null,
        });
        return newTeam;
    } catch (error) {
        throw new Error(`Error adding team:\n${error}`);
    }
}

/**
 * Updates the data of a team in the organization
 * @param {string} id ID of the team to update (Required)
 * @param {Object} data Object containing the fields to update (Required)
 * @param {string} [data.name] Team name
 * @param {Array<string>} [data.teamLead] UUID(s) of team lead(s)
 * @param {string} [data.foundationDate] Team foundation date
 * @param {string} [data.teamLogo] Team logo URL
 * @param {string} [data.description] Team description
 * @param {number} [data.discordId] Team discord role ID
 * @param {Object} [data.customDataPublic] Custom attributes for publicly visible data for team
 * @param {Object} [data.customDataPrivate] Custom attributes for private data for team
 */
export async function updateTeam(id, data) {
    try {
        const team = await organizationTeamModel.findByPk(id);
        if (!team) {
            throw new Error(`Team with ID ${id} not found`);
        }
        await team.update({
            name: data.name || team.name,
            teamLead: data.teamLead || team.teamLead,
            foundationDate: data.foundationDate || team.foundationDate,
            teamLogo: data.teamLogo || team.teamLogo,
            description: data.description || team.description,
            discordId: data.discordId || team.discordId,
            customDataPublic: data.customDataPublic || team.customDataPublic,
            customDataPrivate: data.customDataPrivate || team.customDataPrivate,
        });
        return team;
    } catch (error) {
        throw new Error(`Error updating team:\n${error}`);
    }
}

/**
 * Soft delete a team by setting the deletionDate to the current date.
 *
 * @param {string} id - The ID of the team to be soft deleted (Required).
 * @returns {Object} - The updated team data with the deletionDate set.
 * @throws {Error} - Throws an error if the team cannot be found or updated.
 */
export async function deleteTeam(id) {
    try {
        const team = await organizationTeamModel.findByPk(id);
        if (!team) {
            throw new Error(`Team with ID ${id} not found`);
        }

        // Update the deletionDate to the current date
        team.deletionDate = new Date();
        await team.save();

        // Return the updated team data
        return team;
    } catch (error) {
        throw new Error(`Error deleting team:\n${error}`);
    }
}

/**
 * Handles the upload of team images using Multer.
 *
 * **Important:** When using `uploadTeamImage`, wrap its invocation inside a Promise in your controller function to ensure proper asynchronous handling. This prevents the parent function from mistakenly believing the file upload failed even if it was successful.
 *
 * **Example Usage in Controller:**
 *
 * ```javascript
 * export async function uploadTeamImageController(req, res) {
 *   try {
 *     await new Promise((resolve, reject) => {
 *       uploadTeamImage(req, res, (err) => {
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
 *       file: `/teamImage/${req.file.filename}`,
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
 * `uploadTeamImage` configures Multer to handle image uploads, storing files in the `teamImage/` directory. Only files submitted under the field name `'image'` are accepted.
 *
 * @throws Error if the upload is unsuccessful.
 */
export const uploadTeamImage = multer({
    storage: teamImageStorage,
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'image') {
            cb(null, true);
        } else {
            console.log(`Invalid field for file upload: ${file.fieldname}`);
            cb(new Error('Invalid file upload field'));
        }
    }
}).single('image');

export function getTeamImage(filename){
    return join(join(env.rootLocation, 'teamImage'), `${filename}`);
}
