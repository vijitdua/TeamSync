import axios from "axios";
import {env} from "../config/env";

// catch the error this creates, and update the UI in the function that calls it instead. Also update this to have better doc comments
async function login({username, password}) {
    try {
        const response = await axios.post(
            `${env.backendURL}/auth/login`,
            {
                username,
                password
            },
            {
                withCredentials: true // Ensure cookies are handled
            }
        );

        if (response.status === 200) {
            // Successful login, return true? maybe true on success and throw error always otherwise
            return true;
        } else {
            // throw an error
        }
    } catch (error) {
        throw error;
    }
}