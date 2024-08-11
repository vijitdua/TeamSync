import bcrypt from 'bcryptjs';
import { authUserModel } from '../models/authUserModel.js';

/**
 * Verifies the user's credentials during login.
 *
 * @param {string} username - The username of the user.
 * @param {string} plainTextPassword - The password provided by the user.
 * @returns {Promise<Object>} An object containing the success status and either the user object or an error message.
 */
export async function verifyLoginCredentials(username, plainTextPassword) {
    try {
        const userRecord = await authUserModel.findOne({ where: { username } });
        if (!userRecord) {
            return { success: false, message: 'Incorrect username or password.' };
        }

        const passwordMatches = await bcrypt.compare(plainTextPassword, userRecord.password);
        if (!passwordMatches) {
            return { success: false, message: 'Incorrect username or password.' };
        }

        return { success: true, user: userRecord };
    } catch (error) {
        throw new Error(`Login verification failed: ${error.message}`);
    }
}

/**
 * Handles user registration (signup).
 *
 * @param {string} username - The desired username of the new user.
 * @param {string} plainTextPassword - The desired password of the new user.
 * @returns {Promise<Object>} An object containing the success status and either the new user object or an error message.
 */
export async function registerNewUser(username, plainTextPassword) {
    throw new Error(`External user registration has been disabled`);

    // Uncomment this code to enable external api user-signups, and remove the error above
    // By default, signups are disabled, and you should manually add users.

    // try {
    //     const existingUser = await authUserModel.findOne({ where: { username } });
    //     if (existingUser) {
    //         return { success: false, message: 'Username already taken.' };
    //     }
    //
    //     const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
    //     const newUserRecord = await authUserModel.create({ username, password: hashedPassword });
    //     return { success: true, user: newUserRecord };
    // } catch (error) {
    //     throw new Error(`User registration failed: ${error.message}`);
    // }
}
