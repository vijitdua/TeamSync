import axios from 'axios';
import { env } from '../config/env.js';

/**
 * 
 * @param {Object} team: An object representing the team 
 */
async function createTeam(team) {
    console.log("POST from createTeam with team", team);
    try {
        await axios.post(
            `${env.backendURL}/team`,
            team,
            {
                withCredentials: true // Ensure cookies are handled
            }
        );
    } catch (error) {
        console.error("error response", error.response);
        throw error;
    }
}

export default createTeam;