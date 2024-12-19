import axios from 'axios';
import { env } from '../config/env.js';

// Function to log into the backend
// called from login screen.
async function auth(username, password) {
    try {
        const response = await axios.post(
            `${env.backendURL}/auth/login`,
            {
                username,
                password,
            },
            {
                withCredentials: true // Ensure cookies are handled
            }
        );

        if (response.status === 200) {
            return true;
        } else {
            throw Error("Unsuccessful login.");
        }
    } catch (error) {
        throw error;
    }
}

export { auth };