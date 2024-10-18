import { SlashCommandBuilder } from 'discord.js';
import { getMemberDataPrivate, getUUIDByDiscordId } from '../../services/memberService.js';
import { getTeamPublicData } from '../../services/teamService.js';

export const data = new SlashCommandBuilder()
    .setName('member-data')
    .setDescription('Displays the data of a member.')
    .addStringOption(option =>
        option.setName('member-uuid')
            .setDescription('The UUID of the member')
            .setRequired(false))
    .addUserOption(option =>
        option.setName('discord-user')
            .setDescription('The Discord user')
            .setRequired(false))
    .addBooleanOption(option =>
        option.setName('public-visibility')
            .setDescription('Whether the response should be pasted in the channel (true), or visible only to you (default: false)')
            .setRequired(false));

export async function execute(interaction) {
    // Correctly determine if the response should be ephemeral
    const publicVisibility = interaction.options.getBoolean('public-visibility');
    const isEphemeral = !(publicVisibility ?? false);

    try {
        // Fetch input from the user
        const memberUUID = interaction.options.getString('member-uuid');
        const discordUser = interaction.options.getUser('discord-user');

        let memberData;
        let finalMemberUUID;

        // Fetch member UUID
        if (memberUUID) {
            finalMemberUUID = memberUUID;
        } else if (discordUser) {
            const uuidResponse = await getUUIDByDiscordId(discordUser.id);
            if (!uuidResponse) {
                throw new Error(`No member found for Discord user: ${discordUser.username}.`);
            }
            finalMemberUUID = uuidResponse;
        } else {
            throw new Error('You must provide either a member UUID or a Discord user.');
        }

        // Fetch member data
        const response = await getMemberDataPrivate(finalMemberUUID);
        if (!response.success) {
            throw new Error(`Failed to fetch data for member UUID: ${finalMemberUUID}.`);
        }

        memberData = response.data;

        // Fetch team details
        const teamDetailsPromises = memberData.teams.map(async (teamUUID) => {
            const teamResponse = await getTeamPublicData(teamUUID);
            if (teamResponse.success) {
                const teamData = teamResponse.data;
                return `${teamData.name} (${teamData.discordId ? `<@&${teamData.discordId}>` : 'No Discord role'})`;
            } else {
                return `UUID: ${teamUUID}`;
            }
        });

        const teamDetails = await Promise.all(teamDetailsPromises);
        const teamsDisplay = teamDetails.length > 0 ? teamDetails.join(', ') : 'No teams linked';

        // Construct response message
        const { id, name, discordId } = memberData;
        let responseMessage = `## ${name} ${discordId ? `<@${discordId}>` : ''}\n\n`;
        responseMessage += `UUID: ${id}\n`;
        responseMessage += `Teams: ${teamsDisplay}\n\n`;

        // Excluded fields
        const excludedFields = ['id', 'name', 'discordId', 'teams', 'profilePicture', 'notes', 'updatedAt', 'deletedAt', 'createdAt', 'deletionDate'];

        // Keys to flatten (do not include parent key as heading)
        const keysToFlatten = ['customDataPublic', 'customDataPrivate'];

        // Recursive data formatting
        function formatMemberData(data) {
            let message = '';

            function recurse(obj) {
                for (const key in obj) {
                    if (excludedFields.includes(key)) continue;

                    const value = obj[key];

                    if (typeof value === 'object' && value !== null) {
                        if (Array.isArray(value)) {
                            message += `### ${key}\n`;
                            value.forEach((item) => {
                                message += `- ${item}\n`;
                            });
                        } else {
                            if (keysToFlatten.includes(key)) {
                                recurse(value);
                            } else {
                                message += `### ${key}\n`;
                                recurse(value);
                            }
                        }
                    } else {
                        // Format date fields
                        if (typeof value === 'string' && Date.parse(value)) {
                            const formattedDate = new Date(value).toDateString();
                            message += `### ${key}\n${formattedDate}\n`;
                        } else {
                            message += `### ${key}\n${value}\n`;
                        }
                    }
                }
            }

            recurse(data);
            return message;
        }

        responseMessage += formatMemberData(memberData);

        // Reply with the response
        await interaction.reply({
            content: responseMessage,
            ephemeral: isEphemeral,
        });

    } catch (error) {
        console.error('Error fetching member data:', error);
        await interaction.reply({
            content: `There was an error fetching the member data: ${error.message}`,
            ephemeral: true,
        });
    }
}
