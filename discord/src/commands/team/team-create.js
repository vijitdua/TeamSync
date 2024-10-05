// src/commands/team/create.js

import { SlashCommandBuilder } from 'discord.js';
import { createTeam } from '../../services/teamService.js';
import {getDiscordIdByUsername} from "../../services/discordService.js";
import {getUUIDByDiscordId} from "../../services/memberService.js";
/**
 * Data builder for the /team-create command. Defines the command name, description,
 * and the input options (team name, teamLead mention, foundationDate, logo, description, and role).
 */
export const data = new SlashCommandBuilder()
    .setName('team-create')
    .setDescription('Create a new team with optional role association')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('The name of the team')
            .setRequired(true))
    .addUserOption(option =>
        option.setName('teamlead')
            .setDescription('Mention the team lead (Discord user)')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('foundationdate')
            .setDescription('The foundation date of the team in YYYY-MM-DD format')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('teamlogo')
            .setDescription('The URL to the team logo')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('description')
            .setDescription('The description of the team')
            .setRequired(false))
    .addRoleOption(option =>
        option.setName('role')
            .setDescription('The Discord role associated with the team'))
    .addStringOption(option =>
        option.setName('customdatapublic')
            .setDescription('Public custom data in JSON format')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('customdataprivate')
            .setDescription('Private custom data in JSON format')
            .setRequired(false));

/**
 * Executes the /team-create command.
 *
 * @param {CommandInteraction} interaction - The interaction object representing the command and its arguments.
 * @returns {Promise<void>}
 *
 * This function gathers the user's input, such as the team name, team lead (by mention), description, and optional Discord role.
 * It then fetches the team lead's UUID from the backend by querying first for the Discord ID, and then the UUID,
 * and finally sends the data to the backend to create the team.
 */
export async function execute(interaction) {
    const teamName = interaction.options.getString('name');
    const mentionedUser = interaction.options.getUser('teamlead');  // The mentioned user
    const discordUsername = mentionedUser.username;

    // Step 1: Fetch the Discord ID using the username
    const discordId = await getDiscordIdByUsername(discordUsername);
    if (!discordId) {
        await interaction.reply({ content: `Could not find Discord ID for the team lead: ${discordUsername}`, ephemeral: true });
        return;
    }

    // Step 2: Fetch the UUID using the Discord ID
    const teamLeadUUID = await getUUIDByDiscordId(discordId);
    if (!teamLeadUUID) {
        await interaction.reply({ content: `Could not find UUID for the team lead with Discord ID: ${discordId}`, ephemeral: true });
        return;
    }

    // Other optional fields
    const foundationDate = interaction.options.getString('foundationdate') || new Date().toISOString().split('T')[0];  // Default to today
    const teamLogo = interaction.options.getString('teamlogo') || 'https://example.com/default-logo.png';  // Default logo
    const teamDescription = interaction.options.getString('description') || 'No description provided';
    const role = interaction.options.getRole('role');
    const customDataPublic = interaction.options.getString('customdatapublic') ? JSON.parse(interaction.options.getString('customdatapublic')) : {};
    const customDataPrivate = interaction.options.getString('customdataprivate') ? JSON.parse(interaction.options.getString('customdataprivate')) : {};

    const teamData = {
        name: teamName,
        teamLead: [teamLeadUUID],  // Pass the fetched UUID as the team lead
        foundationDate: foundationDate,
        teamLogo: teamLogo,
        description: teamDescription,
        discordId: role ? role.id : null,  // Optional Discord role ID
        customDataPublic: customDataPublic,  // Custom public data
        customDataPrivate: customDataPrivate  // Custom private data
    };

    const result = await createTeam(teamData);

    if (result.success) {
        await interaction.reply(result.message);  // Success response
    } else {
        await interaction.reply({ content: `Error: ${result.message}`, ephemeral: true });  // Error response (ephemeral for privacy)
    }
}
