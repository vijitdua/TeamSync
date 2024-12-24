import axios from 'axios';
import { env } from '../config/env.js';

async function checkAuth() {
    console.log("requesting", `${env.backendURL}/auth/check`);
    try {
        await axios.get(
            `${env.backendURL}/auth/check`,
            {
                withCredentials: true // Ensure cookies are handled
            }
        ).then((response) => {
            console.log(response);
            console.log(response.data);
        });
        return false;
    } catch (error) {
        return false;
    }
}

export default checkAuth;