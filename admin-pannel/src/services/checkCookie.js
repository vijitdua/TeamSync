import axios from 'axios';
import { env } from '../config/env.js';

async function checkAuth() {
    console.log("requesting", `${env.backendURL}/auth/cookie`);
    try {
        await axios.get(
            `${env.backendURL}/auth/cookie`,
            {
                withCredentials: true // Ensure cookies are handled
            }
        ).then((response) => {
            console.log("cookie check response received:", response);
        });
        return false;
    } catch (error) {
        return false;
    }
}

export default checkAuth;