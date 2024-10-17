import { SlashCommandBuilder } from 'discord.js';
import { deleteTeam, getTeamUUIDByDiscordRoleId } from '../../services/teamService.js';
import {env} from "../../config/env.js";  // Service for deleting a team and retrieving team UUID by Discord role

export const data = new SlashCommandBuilder()
    .setName('team-delete')
    .setDescription('Deletes an existing team using the provided team UUID or Discord role.')
    .addStringOption(option =>
        option.setName('team-id')
            .setDescription('The UUID of the team to delete (optional)')
            .setRequired(false))
    .addRoleOption(option =>
        option.setName('discord-role')
            .setDescription('The Discord role associated with the team to delete (optional)')
            .setRequired(false));

export async function execute(interaction) {
    if (!interaction.member.roles.cache.has(env.discordSecureAccessRoleID)) {
        await interaction.reply({
            content: 'You do not have permission to use this command.',
            ephemeral: true,
        });
        return;
    }
    try {
        const teamId = interaction.options.getString('team-id');
        const discordRole = interaction.options.getRole('discord-role');

        let finalTeamId = teamId;

        // If no team UUID is provided but a Discord role is, fetch the team UUID via the role
        if (!teamId && discordRole) {
            finalTeamId = await getTeamUUIDByDiscordRoleId(discordRole.id);
            if (!finalTeamId) {
                throw new Error(`No team found for the Discord role ${discordRole.name}`);
            }
        }

        // If no teamId or discord role is provided, throw an error
        if (!finalTeamId) {
            throw new Error('You must provide either a team UUID or a Discord role to delete the team.');
        }

        // Try to delete the team by calling the deleteTeam function
        const response = await deleteTeam(finalTeamId);

        // Send feedback based on the result
        if (response.success) {
            await interaction.reply({
                content: `Team "${finalTeamId}" deleted successfully.`,
                ephemeral: true
            });
        } else {
            throw new Error(response.message || 'Failed to delete team.');
        }

    } catch (error) {
        // Catch any error that occurs during execution and send a more detailed message
        console.error('Error deleting team:', error);
        await interaction.reply({
            content: `There was an error while deleting the team: ${error.message}`,
            ephemeral: true
        });
    }
}
