import { SlashCommandBuilder } from 'discord.js';
import { createTeam } from '../../services/teamService.js';
import { getUUIDByDiscordId } from "../../services/memberService.js";
import {env} from "../../config/env.js";

export const data = new SlashCommandBuilder()
    .setName('team-create')
    .setDescription('Creates a new team using the provided details.')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('The name of the team')
            .setRequired(true))
    .addRoleOption(option =>
        option.setName('discord-role')
            .setDescription('The Discord role associated with the team (optional)')
            .setRequired(false))
    .addUserOption(option =>
        option.setName('team-lead')
            .setDescription('Team lead, user must already be present in the member\'s directory. To add multiple use web-client')
            .setRequired(false))  // Single input for now
    .addStringOption(option =>
        option.setName('foundation-date')
            .setDescription('The foundation date of the team (optional, format: YYYY-MM-DD)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('description')
            .setDescription('A brief description of the team (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('custom-data-public')
            .setDescription('Custom public data for the team in JSON format (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('custom-data-private')
            .setDescription('Custom private data for the team in JSON format (optional)')
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
        const teamName = interaction.options.getString('name');
        const discordRole = interaction.options.getRole('discord-role');
        const teamLead = interaction.options.getUser('team-lead');  // Assuming one user for now
        const foundationDate = interaction.options.getString('foundation-date');
        const description = interaction.options.getString('description');
        const customDataPublic = interaction.options.getString('custom-data-public');
        const customDataPrivate = interaction.options.getString('custom-data-private');

        let teamLeadUUID = null;
        let teamLeadError = null;

        // Handle a single team lead for now, you can expand this to handle multiple later
        if (teamLead) {
            try {
                const uuid = await getUUIDByDiscordId(teamLead.id);
                if (!uuid) {
                    throw new Error(`Failed to fetch UUID for team lead: ${teamLead.username} (user might not exist in the system).`);
                }
                teamLeadUUID = uuid;
            } catch (error) {
                teamLeadError = `Error fetching team lead UUID: ${teamLead.username}. ${error.message}`;
                console.error('Error fetching team lead UUID:', error);
            }
        }

        // Prepare the team data to send to the backend
        const teamData = {
            name: teamName,
            discordId: discordRole ? discordRole.id : null,
            teamLead: teamLeadUUID ? [teamLeadUUID] : [],
            foundationDate: foundationDate ? new Date(foundationDate).toISOString() : null,
            description: description || '',
            customDataPublic: customDataPublic ? JSON.parse(customDataPublic) : {},
            customDataPrivate: customDataPrivate ? JSON.parse(customDataPrivate) : {}
        };

        // Call the createTeam function
        const response = await createTeam(teamData);

        // Send feedback based on the result
        if (response.success) {
            let successMessage = `Team "${teamName}" created successfully!`;
            if (teamLeadError) {
                successMessage += `\n${teamLeadError}`;  // Log error regarding the team lead
            }

            await interaction.reply({
                content: successMessage,
                ephemeral: true
            });
        } else {
            throw new Error(response.message || 'Failed to create team.');
        }

    } catch (error) {
        console.error('Error creating team:', error);
        await interaction.reply({
            content: `There was an error while creating the team: ${error.message}`,
            ephemeral: true
        });
    }
}
