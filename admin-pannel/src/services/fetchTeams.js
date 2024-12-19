import axios from 'axios';
import { env } from '../config/env.js';

async function fetchTeams() {
    try {
        const result = [];
        const response = await axios.get(
            `${env.backendURL}/team`,
            {
                withCredentials: true // Ensure cookies are handled
            }
        );
        const idList = response.data.data;
        for (let id of idList) {
            const response = await axios.get(
                `${env.backendURL}/team/${id}`,
                {
                    withCredentials: true // Ensure cookies are handled
                }
            );
            result.push(response.data.data);
        }
        return result;
    } catch (error) {
        throw error;
    }
}

export default fetchTeams;