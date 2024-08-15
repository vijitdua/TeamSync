import readline from 'readline';
import bcrypt from 'bcryptjs';
import { authUserModel } from './src/models/authUserModel.js';
import { sequelize } from './src/config/database.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => rl.question(question, resolve));
};

// Standalone function to handle user registration
async function registerNewUser(username, password) {
    try {
        const existingUser = await authUserModel.findOne({ where: { username } });
        if (existingUser) {
            return { success: false, message: 'Username already taken.' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await authUserModel.create({ username, password: hashedPassword });
        return { success: true, user: newUser };
    } catch (error) {
        throw new Error(`User registration failed: ${error.message}`);
    }
}

(async () => {
    try {
        console.log("Register a New User");

        const username = await askQuestion("Username: ");
        const password = await askQuestion("Password: ");

        const { success, user, message } = await registerNewUser(username, password);

        if (success) {
            console.log("User registered successfully:", user.username);
        } else {
            console.log("Registration failed:", message);
        }
    } catch (error) {
        console.error("An error occurred:", error.message);
    } finally {
        rl.close();
        await sequelize.close(); // Ensure the connection to the database is closed properly
    }
})();
