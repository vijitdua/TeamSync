import axios from 'axios';
import { env } from '../config/env.js';

async function getMemberIdFromName(name) {
    try {
        const response = await axios.get(
            `${env.backendURL}/member`,
            {
                withCredentials: true // Ensure cookies are handled
            }
        );
        const memberIds = response.data.data;
        for (let id of memberIds) {
            const response = await axios.get(
                `${env.backendURL}/member/${id}`,
                {
                    withCredentials: true // Ensure cookies are handled
                }
            );
            if (response.data.data.name === name) {
                return response.data.data;
            }
        }
        return null;
    } catch (error) {
        throw error;
    }
}

export default getMemberIdFromName;