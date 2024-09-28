import axios from 'axios';
import { env } from '../config/env.js';

let sessionCookie = null;

// Function to log into the backend
async function auth() {
    try {
        const response = await axios.post(
            `${env.backendURL}/auth/login`,
            {
                username: env.backendUsername,
                password: env.backendPassword
            },
            {
                withCredentials: true // Ensure cookies are handled
            }
        );

        if (response.status === 200) {
            sessionCookie = response.headers['set-cookie'][0]; // Store the session cookie
            console.log('Successfully logged into the backend.');
        } else {
            console.error('Failed to log into the backend:', response.statusText);
        }
    } catch (error) {
        console.error('Error logging into the backend:', error.message);
    }
}

export { auth, sessionCookie };