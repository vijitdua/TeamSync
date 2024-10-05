import { SlashCommandBuilder } from 'discord.js';
import { createMember } from '../../services/memberService.js';
import { getTeamUUIDByDiscordRoleId } from '../../services/teamService.js';

export const data = new SlashCommandBuilder()
    .setName('member-create')
    .setDescription('Creates a new member using the provided details.')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('The name of the member')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('position')
            .setDescription('The member\'s position')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('email')
            .setDescription('The member\'s email (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('phone-number')
            .setDescription('The member\'s phone number (optional)')
            .setRequired(false))
    .addUserOption(option =>
        option.setName('discord')
            .setDescription('The Discord @ of the member (optional)')
            .setRequired(false))
    .addRoleOption(option =>
        option.setName('discord-teams')
            .setDescription('The Discord team roles (to add multiple teams, use web-client – discord doesn\'t support it)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('team-uuids')
            .setDescription('Comma-separated list of team UUIDs (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('notes')
            .setDescription('Admin notes about the member (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('join-date')
            .setDescription('The date the member joined (optional, format: YYYY-MM-DD)')
            .setRequired(false));

export async function execute(interaction) {
    try {
        const name = interaction.options.getString('name');
        const position = interaction.options.getString('position');
        const email = interaction.options.getString('email');
        const phoneNumber = interaction.options.getString('phone-number');
        const discordUser = interaction.options.getUser('discord');
        const discordTeamRoles = interaction.options.getRole('discord-teams');  // Multiple Discord teams
        const teamUUIDsString = interaction.options.getString('team-uuids');
        const notes = interaction.options.getString('notes');
        const joinDate = interaction.options.getString('join-date');

        let teamUUIDs = [];
        let errors = [];

        // Fetch UUIDs for multiple Discord team roles
        if (discordTeamRoles) {
            for (const role of discordTeamRoles) {
                try {
                    const teamUUID = await getTeamUUIDByDiscordRoleId(role.id);
                    if (teamUUID) {
                        teamUUIDs.push(teamUUID);
                    }
                } catch (error) {
                    errors.push(`Failed to fetch team UUID for role ${role.name}`);
                }
            }
        }

        // Add additional team UUIDs from the provided list if any
        if (teamUUIDsString) {
            teamUUIDs = [...teamUUIDs, ...teamUUIDsString.split(',').map(uuid => uuid.trim())];
        }

        // Prepare the member data to send to the backend
        const memberData = {
            name,
            position,
            email: email || null,
            phoneNumber: phoneNumber || null,
            discordId: discordUser ? discordUser.id : null,
            teams: teamUUIDs.length > 0 ? teamUUIDs : null,
            notes: notes || '',
            joinDate: joinDate ? new Date(joinDate).toISOString() : null
        };

        // Call the createMember function to send the data
        const response = await createMember(memberData);

        // Send feedback based on the result
        if (response.success) {
            let successMessage = `Member "${name}" created successfully!`;
            if (errors.length > 0) {
                successMessage += `\nHowever, there were some issues:\n- ${errors.join('\n- ')}`;
            }
            await interaction.reply({
                content: successMessage,
                ephemeral: true
            });
        } else {
            throw new Error(response.message || 'Failed to create member.');
        }

    } catch (error) {
        // Catch any error that occurs during execution and send a more detailed message
        console.error('Error creating member:', error);
        await interaction.reply({
            content: `There was an error while creating the member: ${error.message}`,
            ephemeral: true
        });
    }
}
