import axios from 'axios';
import { env } from '../config/env.js';

async function fetchMember(id) {
    try {
        console.log("getting member of id " + id)
        const response = await axios.get(
            `${env.backendURL}/member/${id}`,
            {
                withCredentials: true // Ensure cookies are handled
            }
        );
        console.log(response);
        return response.data.data;
    } catch (error) {
        throw error;
    }
}

export default fetchMember;