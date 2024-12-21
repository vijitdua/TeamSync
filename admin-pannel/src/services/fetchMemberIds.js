import axios from 'axios';
import { env } from '../config/env.js';

async function fetchMemberIds() {
    try {
        const response = await axios.get(
            `${env.backendURL}/member`,
            {
                withCredentials: true // Ensure cookies are handled
            }
        );
        return (response.data.data);
    } catch (error) {
        throw error;
    }
}

export default fetchMemberIds;