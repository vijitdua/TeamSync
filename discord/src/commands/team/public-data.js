import { SlashCommandBuilder } from 'discord.js';
import { getTeamPublicData, getTeamUUIDByDiscordRoleId } from '../../services/teamService.js';
import {getDiscordIdByMemberUUID} from "../../services/memberService.js";

export const data = new SlashCommandBuilder()
    .setName('team-public-data')
    .setDescription('Displays the public data of a team by UUID or Discord role.')
    .addStringOption(option =>
        option.setName('team-id')
            .setDescription('The UUID of the team you want to view (optional if using Discord role).')
            .setRequired(false))
    .addRoleOption(option =>
        option.setName('discord-role')
            .setDescription('The Discord role associated with the team (optional if using team UUID).')
            .setRequired(false));

export async function execute(interaction) {
    try {
        const teamId = interaction.options.getString('team-id');
        const discordRole = interaction.options.getRole('discord-role');

        let teamUUID = teamId;

        // If no UUID is provided, fetch the UUID using the Discord role
        if (!teamUUID && discordRole) {
            teamUUID = await getTeamUUIDByDiscordRoleId(discordRole.id);
            if (!teamUUID) {
                throw new Error(`Failed to fetch team UUID for Discord role: ${discordRole.name}`);
            }
        }

        if (!teamUUID) {
            await interaction.reply({
                content: 'You must provide either a team UUID or a Discord role to view the team data.',
                ephemeral: true
            });
            return;
        }

        // Fetch public team data
        const response = await getTeamPublicData(teamUUID);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch public team data.');
        }

        const teamData = response.data;

        // Format the Discord role mention
        const discordRoleMention = teamData.discordId ? `<@&${teamData.discordId}>` : '– `No Discord role`';

        const teamLeadMentions = await Promise.all(
            teamData.teamLead.map(async (leadUUID) => {
                const discordId = await getDiscordIdByMemberUUID(leadUUID); // Fetch Discord ID
                return discordId ? `<@${discordId}>` : `UUID: ${leadUUID}`;
            })
        );
        const teamLeadDisplay = teamLeadMentions.length > 0 ? teamLeadMentions.join(', ') : 'No team lead found';


        // Create the message output
        let teamInfo = `# ${teamData.name} ${discordRoleMention}\n\n`;
        teamInfo += `**UUID:** \`${teamData.id}\`\n\n`;
        teamInfo += `### Team Lead(s):\n${teamLeadDisplay}\n\n`;
        teamInfo += `### Foundation Date:\n${teamData.foundationDate ? new Date(teamData.foundationDate).toDateString() : 'N/A'}\n\n`;
        teamInfo += `### Description:\n${teamData.description || 'No description'}\n\n`;

        // Display custom public data as headings
        if (teamData.customDataPublic) {
            for (const [key, value] of Object.entries(teamData.customDataPublic)) {
                teamInfo += `### ${key}:\n${value}\n\n`;
            }
        }

        await interaction.reply({
            content: teamInfo,
            ephemeral: true
        });

    } catch (error) {
        console.error('Error fetching public team data:', error);
        await interaction.reply({
            content: `There was an error fetching the team's public data: ${error.message}`,
            ephemeral: true
        });
    }
}
