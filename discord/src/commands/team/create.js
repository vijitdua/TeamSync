import { SlashCommandBuilder } from 'discord.js';
import { createTeam } from '../../services/teamService.js';
import { getUUIDByDiscordId} from "../../services/memberService.js";

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
            .setDescription('The team lead (optional), this discord user must already be present in the member\'s directory')
            .setRequired(false))
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
    const teamName = interaction.options.getString('name');
    const discordRole = interaction.options.getRole('discord-role');
    const teamLead = interaction.options.getUser('team-lead');
    const foundationDate = interaction.options.getString('foundation-date');
    const description = interaction.options.getString('description');
    const customDataPublic = interaction.options.getString('custom-data-public');
    const customDataPrivate = interaction.options.getString('custom-data-private');

    let teamLeadUUID = null;
    if (teamLead) {
        teamLeadUUID = await getUUIDByDiscordId(teamLead.id);
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

    // Call the createTeam function to send the data
    const response = await createTeam(teamData);

    // Send feedback based on the result
    if (response.success) {
        await interaction.reply({
            content: `Team "${teamName}" created successfully!`,
            ephemeral: true
        });
    } else {
        await interaction.reply({
            content: `Failed to create team: ${response.message}`,
            ephemeral: true
        });
    }
}
