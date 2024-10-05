import { SlashCommandBuilder } from 'discord.js';
import { updateTeam, getTeamUUIDByDiscordRoleId } from '../../services/teamService.js';
import { getUUIDByDiscordId } from "../../services/memberService.js";

export const data = new SlashCommandBuilder()
    .setName('team-update')
    .setDescription('Updates an existing team using either the team UUID or Discord role.')
    .addStringOption(option =>
        option.setName('team-id')
            .setDescription('The UUID of the team to update (optional if using Discord role)')
            .setRequired(false))
    .addRoleOption(option =>
        option.setName('discord-role')
            .setDescription('The Discord role associated with the team (optional if using team UUID)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('name')
            .setDescription('The new name of the team (optional)')
            .setRequired(false))
    .addUserOption(option =>
        option.setName('team-lead')
            .setDescription('The new team lead (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('foundation-date')
            .setDescription('The new foundation date of the team (optional, format: YYYY-MM-DD)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('description')
            .setDescription('The new description of the team (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('custom-data-public')
            .setDescription('Updated custom public data for the team in JSON format (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('custom-data-private')
            .setDescription('Updated custom private data for the team in JSON format (optional)')
            .setRequired(false));

export async function execute(interaction) {
    try {
        const teamId = interaction.options.getString('team-id');
        const discordRole = interaction.options.getRole('discord-role');
        const teamName = interaction.options.getString('name');
        const teamLead = interaction.options.getUser('team-lead');
        const foundationDate = interaction.options.getString('foundation-date');
        const description = interaction.options.getString('description');
        const customDataPublic = interaction.options.getString('custom-data-public');
        const customDataPrivate = interaction.options.getString('custom-data-private');

        let teamUUID = teamId;
        let teamLeadUUID = null;
        let teamLeadError = null;

        // If no UUID is provided, but a Discord role is, fetch the team UUID from the Discord role
        if (!teamUUID && discordRole) {
            try {
                teamUUID = await getTeamUUIDByDiscordRoleId(discordRole.id);
                if (!teamUUID) {
                    throw new Error(`Failed to fetch team UUID for Discord role: ${discordRole.name}`);
                }
            } catch (error) {
                await interaction.reply({
                    content: `Error fetching team UUID for role: ${discordRole.name}. ${error.message}`,
                    ephemeral: true
                });
                return;
            }
        }

        if (!teamUUID) {
            await interaction.reply({
                content: 'You must provide either a team UUID or a Discord role to update the team.',
                ephemeral: true
            });
            return;
        }

        // Try to get the team lead UUID if provided
        if (teamLead) {
            try {
                const uuid = await getUUIDByDiscordId(teamLead.id);
                if (!uuid) {
                    throw new Error(`Failed to fetch UUID for team lead: ${teamLead.username}`);
                }
                teamLeadUUID = uuid;
            } catch (error) {
                teamLeadError = `Error fetching team lead UUID: ${teamLead.username}. ${error.message}`;
                console.error('Error fetching team lead UUID:', error);
            }
        }

        // Prepare the team data to send to the backend
        const teamData = {
            name: teamName || null,
            discordId: discordRole ? discordRole.id : null,
            teamLead: teamLeadUUID ? [teamLeadUUID] : [],
            foundationDate: foundationDate ? new Date(foundationDate).toISOString() : null,
            description: description || '',
            customDataPublic: customDataPublic ? JSON.parse(customDataPublic) : {},
            customDataPrivate: customDataPrivate ? JSON.parse(customDataPrivate) : {}
        };

        // Call the updateTeam function to send the data
        const response = await updateTeam(teamUUID, teamData);

        // Send feedback based on the result
        if (response.success) {
            let successMessage = `Team "${teamUUID}" updated successfully!`;
            if (teamLeadError) {
                successMessage += `\n${teamLeadError}`; // Log error regarding the team lead if any
            }

            await interaction.reply({
                content: successMessage,
                ephemeral: true
            });
        } else {
            throw new Error(response.message || 'Failed to update team.');
        }

    } catch (error) {
        console.error('Error updating team:', error);
        await interaction.reply({
            content: `There was an error while updating the team: ${error.message}`,
            ephemeral: true
        });
    }
}
