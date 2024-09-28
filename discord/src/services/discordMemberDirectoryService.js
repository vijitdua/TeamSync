// services/discordMemberService.js
import axios from 'axios';
import { env } from '../config/env.js';
import { sessionCookie } from './auth.js'; // Import session cookie from auth.js

// Function to initialize or update a member's details
async function updateMemberDetails(discordID, discordUsername, discordDisplayName, discordProfilePictureUrl) {
    try {
        const memberData = {
            discordID,
            discordUsername,
            discordDisplayName,
            discordProfilePictureUrl,
        };

        const response = await axios.post(`${env.backendURL}/discord/member`, memberData, {
            headers: {
                Cookie: sessionCookie // Use session cookie from auth.js
            }
        });

        if (response.status === 200) {
            console.log(`Member ${discordUsername} updated or initialized successfully.`);
        } else {
            console.error(`Error updating member: ${response.data.message}`);
        }
    } catch (error) {
        console.error(`Error in member update: ${error.message}`);
    }
}

async function deleteAllMembers() {
    try {
        const response = await axios.delete(`${env.backendURL}/discord/member`, {
            headers: {
                Cookie: sessionCookie // Use session cookie from auth.js
            }
        });

        if (response.status === 200) {
            console.log('All members deleted successfully.');
        } else {
            console.error(`Error deleting members: ${response.data.message}`);
        }
    } catch (error) {
        console.error(`Error in member deletion: ${error.message}`);
    }
}

async function reinitializeMembers(guild) {
    try {
        // Fetch all members from the guild
        const members = await guild.members.fetch();

        for (const [id, member] of members) {
            const discordID = member.id;
            const discordUsername = member.user.username;
            const discordDisplayName = member.displayName;
            const discordProfilePictureUrl = member.user.displayAvatarURL();

            // Reinitialize member in the backend
            await updateMemberDetails(discordID, discordUsername, discordDisplayName, discordProfilePictureUrl);
        }
        console.log('Members reinitialized successfully.');
    } catch (error) {
        console.error('Error reinitializing members:', error);
    }
}

export { updateMemberDetails, deleteAllMembers, reinitializeMembers };