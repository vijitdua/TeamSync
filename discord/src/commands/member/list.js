import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getAllMemberDataList } from '../../services/memberService.js';
import { getTeamPublicData } from '../../services/teamService.js';

export const data = new SlashCommandBuilder()
    .setName('member-list')
    .setDescription('Displays a list of all members with details.')
    .addBooleanOption(option =>
        option.setName('public-visibility')
            .setDescription('Whether the response should be pasted in the channel (true), or visible only to you (default: false)')
            .setRequired(false));

export async function execute(interaction) {
    // Correctly determine if the response should be ephemeral
    const publicVisibility = interaction.options.getBoolean('public-visibility');
    const isEphemeral = !(publicVisibility ?? false);

    try {
        // Fetch all members' data
        const response = await getAllMemberDataList();

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch member data.');
        }

        const members = response.data;

        // Prepare embed(s)
        const embeds = [];
        let currentEmbed = new EmbedBuilder()
            .setTitle('Member List')
            .setColor(0x3498db);

        let fieldCount = 0;
        let totalEmbedCharacters = 0;

        for (const member of members) {
            // Fetch teams and handle unknown ones
            const teamDetails = await Promise.all(
                member.teamsUUID.map(async (teamUUID) => {
                    const teamData = await getTeamPublicData(teamUUID);
                    if (teamData.success && teamData.data) {
                        const teamName = teamData.data.name || 'Unknown Team';
                        const discordRole = teamData.data.discordId ? `<@&${teamData.data.discordId}>` : 'No Discord Role';
                        return teamName !== 'Unknown Team' ? `${teamName} ${discordRole}` : null;
                    }
                    return null; // Return null if team fetching fails
                })
            );

            const filteredTeamDetails = teamDetails.filter(team => team !== null);
            const teamDisplay = filteredTeamDetails.length > 0 ? filteredTeamDetails.join('\n• ') : 'No teams assigned';

            // Create the Discord mention if available
            const discordDisplay = member.discordID ? `<@${member.discordID}>` : 'No Discord ID';

            // Construct field value
            const fieldValue = `**UUID:** \`${member.UUID}\`\n` +
                `**Discord:** ${discordDisplay}\n` +
                `**Position:** ${member.position || 'No position'}\n` +
                `**Teams:**\n• ${teamDisplay}`;

            // Ensure field value does not exceed 1024 characters
            const truncatedFieldValue = fieldValue.length > 1024 ? fieldValue.substring(0, 1021) + '...' : fieldValue;

            // Calculate new total characters if this field is added
            const additionalChars = member.memberName.length + truncatedFieldValue.length;
            if (
                fieldCount >= 25 ||
                totalEmbedCharacters + additionalChars > 6000
            ) {
                // Start a new embed
                embeds.push(currentEmbed);
                currentEmbed = new EmbedBuilder()
                    .setTitle('Member List (Continued)')
                    .setColor(0x3498db);
                fieldCount = 0;
                totalEmbedCharacters = 0;
            }

            // Add member info as a field
            currentEmbed.addFields({
                name: member.memberName,
                value: truncatedFieldValue,
            });

            fieldCount++;
            totalEmbedCharacters += additionalChars;
        }

        // Add the last embed if it has fields
        if (fieldCount > 0) {
            embeds.push(currentEmbed);
        }

        // Send the embeds in batches (Discord allows up to 10 embeds per message)
        const maxEmbedsPerMessage = 10;
        for (let i = 0; i < embeds.length; i += maxEmbedsPerMessage) {
            const embedsSlice = embeds.slice(i, i + maxEmbedsPerMessage);
            if (i === 0) {
                await interaction.reply({ embeds: embedsSlice, ephemeral: isEphemeral });
            } else {
                await interaction.followUp({ embeds: embedsSlice, ephemeral: isEphemeral });
            }
        }

    } catch (error) {
        console.error('Error fetching member list:', error);
        await interaction.reply({
            content: `There was an error fetching the member list: ${error.message}`,
            ephemeral: true,
        });
    }
}