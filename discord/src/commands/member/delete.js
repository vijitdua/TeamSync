import { SlashCommandBuilder } from 'discord.js';
import { deleteMember, getUUIDByDiscordId } from '../../services/memberService.js';

export const data = new SlashCommandBuilder()
    .setName('member-delete')
    .setDescription('Deletes a member using their Discord @ or UUID.')
    .addUserOption(option =>
        option.setName('discord')
            .setDescription('The Discord @ of the member to delete (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('uuid')
            .setDescription('The UUID of the member to delete (optional)')
            .setRequired(false));

export async function execute(interaction) {
    try {
        const discordUser = interaction.options.getUser('discord');
        const memberUUID = interaction.options.getString('uuid');

        let memberId = memberUUID;
        let errors = [];

        // Fetch the member UUID if only Discord @ is provided
        if (discordUser && !memberUUID) {
            try {
                memberId = await getUUIDByDiscordId(discordUser.id);
                if (!memberId) {
                    throw new Error(`Failed to fetch member UUID from Discord @: ${discordUser.tag}`);
                }
            } catch (error) {
                errors.push(`Failed to find member by Discord @: ${discordUser.tag}`);
            }
        }

        if (!memberId) {
            throw new Error('Please provide either a valid Member UUID or Discord @.');
        }

        // Call the deleteMember function to remove the member
        const response = await deleteMember(memberId);

        // Send feedback based on the result
        if (response.success) {
            let successMessage = `Member ${discordUser ? `@${discordUser.tag}` : `UUID: ${memberUUID}`} deleted successfully!`;
            if (errors.length > 0) {
                successMessage += `\nHowever, there were some issues:\n- ${errors.join('\n- ')}`;
            }
            await interaction.reply({
                content: successMessage,
                ephemeral: true
            });
        } else {
            throw new Error(response.message || 'Failed to delete member.');
        }

    } catch (error) {
        // Catch any error that occurs during execution and send a more detailed message
        console.error('Error deleting member:', error);
        await interaction.reply({
            content: `There was an error while deleting the member: ${error.message}`,
            ephemeral: true
        });
    }
}
