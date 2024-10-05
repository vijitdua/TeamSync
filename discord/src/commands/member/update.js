import { SlashCommandBuilder } from 'discord.js';
import { updateMember } from '../../services/memberService.js';
import { getUUIDByDiscordId } from '../../services/memberService.js';
import { getTeamUUIDByDiscordRoleId } from '../../services/teamService.js';

export const data = new SlashCommandBuilder()
    .setName('member-update')
    .setDescription('Updates an existing member by Discord @ or Member UUID.')
    .addUserOption(option =>
        option.setName('discord')
            .setDescription('The Discord @ of the member (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('uuid')
            .setDescription('The UUID of the member (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('name')
            .setDescription('The updated name of the member (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('position')
            .setDescription('The updated position of the member (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('email')
            .setDescription('The updated email of the member (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('phone-number')
            .setDescription('The updated phone number of the member (optional)')
            .setRequired(false))
    .addRoleOption(option =>
        option.setName('discord-teams')
            .setDescription('The Discord team roles for the member (optional)')
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
        const discordUser = interaction.options.getUser('discord');
        const memberUUID = interaction.options.getString('uuid');
        const name = interaction.options.getString('name');
        const position = interaction.options.getString('position');
        const email = interaction.options.getString('email');
        const phoneNumber = interaction.options.getString('phone-number');
        const discordTeamRoles = interaction.options.getRole('discord-teams');  // Multiple Discord teams
        const teamUUIDsString = interaction.options.getString('team-uuids');
        const notes = interaction.options.getString('notes');
        const joinDate = interaction.options.getString('join-date');

        let memberId = memberUUID; // Start with provided UUID (if any)
        let teamUUIDs = [];
        let errors = [];

        // Fetch the member UUID if only Discord @ is provided
        if (discordUser && !memberUUID) {
            try {
                memberId = await getUUIDByDiscordId(discordUser.id);
                if (!memberId) {
                    throw new Error('Failed to fetch member UUID from Discord @.');
                }
            } catch (error) {
                errors.push(`Failed to find member by Discord @: ${discordUser.tag}`);
            }
        }

        if (!memberId) {
            throw new Error('Please provide either a valid Member UUID or Discord @.');
        }

        // Fetch UUIDs for multiple Discord team roles
        if (discordTeamRoles) {
            try {
                const teamUUID = await getTeamUUIDByDiscordRoleId(discordTeamRoles.id);
                if (teamUUID) {
                    teamUUIDs.push(teamUUID);
                }
            } catch (error) {
                errors.push(`Failed to fetch team UUID for role ${discordTeamRoles.name}`);
            }
        }

        // Add additional team UUIDs from the provided list if any
        if (teamUUIDsString) {
            teamUUIDs = [...teamUUIDs, ...teamUUIDsString.split(',').map(uuid => uuid.trim())];
        }

        // Prepare the member data to update
        const memberData = {
            name: name || null,
            position: position || null,
            email: email || null,
            phoneNumber: phoneNumber || null,
            discordId: discordUser ? discordUser.id : null,
            teams: teamUUIDs.length > 0 ? teamUUIDs : null,
            notes: notes || null,
            joinDate: joinDate ? new Date(joinDate).toISOString() : null
        };

        // Call the updateMember function with the member UUID
        const response = await updateMember(memberId, memberData);

        // Send feedback based on the result
        if (response.success) {
            let successMessage = `Member "${name || discordUser.tag || memberUUID}" updated successfully!`;
            if (errors.length > 0) {
                successMessage += `\nHowever, there were some issues:\n- ${errors.join('\n- ')}`;
            }
            await interaction.reply({
                content: successMessage,
                ephemeral: true
            });
        } else {
            throw new Error(response.message || 'Failed to update member.');
        }

    } catch (error) {
        // Catch any error that occurs during execution and send a more detailed message
        console.error('Error updating member:', error);
        await interaction.reply({
            content: `There was an error while updating the member: ${error.message}`,
            ephemeral: true
        });
    }
}
