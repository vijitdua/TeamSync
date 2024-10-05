import { SlashCommandBuilder } from 'discord.js';
import { getMemberDataPublic, getUUIDByDiscordId } from '../../services/memberService.js';
import { getTeamPublicData } from '../../services/teamService.js'; // Importing team service to fetch team data

export const data = new SlashCommandBuilder()
    .setName('member-public-data')
    .setDescription('Displays the public data of a member.')
    .addStringOption(option =>
        option.setName('member-uuid')
            .setDescription('The UUID of the member')
            .setRequired(false))
    .addUserOption(option =>
        option.setName('discord-user')
            .setDescription('The Discord user')
            .setRequired(false));

export async function execute(interaction) {
    try {
        // Fetch input from the user
        const memberUUID = interaction.options.getString('member-uuid');
        const discordUser = interaction.options.getUser('discord-user');

        let memberData;
        let finalMemberUUID;

        // Case 1: Fetch by memberUUID
        if (memberUUID) {
            finalMemberUUID = memberUUID;
        }
        // Case 2: Fetch by Discord user -> Convert to UUID first
        else if (discordUser) {
            const uuidResponse = await getUUIDByDiscordId(discordUser.id);
            if (!uuidResponse) {
                throw new Error(`No member found for Discord user: ${discordUser.username}.`);
            }
            finalMemberUUID = uuidResponse;
        }
        // Case 3: No input provided
        else {
            throw new Error('You must provide either a member UUID or a Discord user.');
        }

        // Fetch member public data using the UUID
        const response = await getMemberDataPublic(finalMemberUUID);
        if (!response.success) {
            throw new Error(`Failed to fetch public data for member UUID: ${finalMemberUUID}.`);
        }

        memberData = response.data;

        // Now fetch team details for each team UUID
        const teamDetailsPromises = memberData.teams.map(async (teamUUID) => {
            const teamResponse = await getTeamPublicData(teamUUID);
            if (teamResponse.success) {
                const teamData = teamResponse.data;
                return `${teamData.name} (<@&${teamData.discordId}>)`;
            } else {
                return `UUID: ${teamUUID}`; // Fallback if team data is not available
            }
        });

        // Resolve all team details promises
        const teamDetails = await Promise.all(teamDetailsPromises);
        const teamsDisplay = teamDetails.length > 0 ? teamDetails.join(', ') : 'No teams linked';

        // Construct the response with member data
        const { name, id, position, phoneNumber, email, discordId, customDataPublic } = memberData;

        let responseMessage = `**${name}**\n` +
            `UUID: \`${id}\`\n` +
            `**Position:** ${position || 'No position specified'}\n` +
            `**Discord:** ${discordId ? `<@${discordId}>` : 'Not linked'}\n` +
            `**Teams:** ${teamsDisplay}`;

        // Add custom public data
        if (customDataPublic && Object.keys(customDataPublic).length > 0) {
            responseMessage += `\n**Custom Public Data:**\n`;
            for (const [key, value] of Object.entries(customDataPublic)) {
                responseMessage += `**${key}:** ${value}\n`;
            }
        }

        // Reply with the response
        await interaction.reply({
            content: responseMessage,
            ephemeral: true
        });

    } catch (error) {
        // Log and respond with more specific error message
        console.error('Error fetching public member data:', error);

        await interaction.reply({
            content: `There was an error fetching the public member data: ${error.message}`,
            ephemeral: true
        });
    }
}
