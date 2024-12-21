import axios from 'axios';
import { env } from '../config/env.js';

async function createTeam(name, teamLead) {
    try {
        await axios.post(
            `${env.backendURL}/team`,
            {
                name,
                teamLead
            },
            {
                withCredentials: true // Ensure cookies are handled
            }
        );
    } catch (error) {
        throw error;
    }
}

export default createTeam;