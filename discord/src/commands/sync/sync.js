// commands/sync/sync-member.js

import { SlashCommandBuilder } from 'discord.js';
import {
    syncDiscordToBackend,
    syncBackendToDiscord,
    syncBothWays
} from '../../services/syncService.js';
import { getUUIDByDiscordId, getDiscordIdByMemberUUID } from '../../services/memberService.js';

export const data = new SlashCommandBuilder()
    .setName('sync-member')
    .setDescription('Synchronizes a member\'s roles and teams between Discord and the backend.')
    .addStringOption(option =>
        option.setName('sync-type')
            .setDescription('Type of synchronization to perform.')
            .setRequired(true)
            .addChoices(
                { name: 'Discord to Backend', value: 'discord-to-backend' },
                { name: 'Backend to Discord', value: 'backend-to-discord' },
                { name: 'Both', value: 'both' },
            ))
    .addUserOption(option =>
        option.setName('discord-user')
            .setDescription('The Discord @ of the member to synchronize.')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('member-uuid')
            .setDescription('The UUID of the member to synchronize.')
            .setRequired(false));

export async function execute(interaction) {
    if (!interaction.member.roles.cache.has(env.discordSecureAccessRoleID)) {
        await interaction.reply({
            content: 'You do not have permission to use this command.',
            ephemeral: true,
        });
        return;
    }
    const syncType = interaction.options.getString('sync-type');
    const discordUser = interaction.options.getUser('discord-user');
    const memberUUID = interaction.options.getString('member-uuid');

    // Ensure at least one identifier is provided
    if (!discordUser && !memberUUID) {
        await interaction.reply({
            content: 'Please provide either a Discord user or a member UUID to synchronize.',
            ephemeral: true,
        });
        return;
    }

    let targetDiscordId = null;
    let targetMemberUUID = null;

    // Resolve identifiers
    try {
        if (discordUser) {
            targetDiscordId = discordUser.id;
            // If memberUUID is also provided, verify consistency
            if (memberUUID) {
                const resolvedUUID = await getUUIDByDiscordId(targetDiscordId);
                if (resolvedUUID !== memberUUID) {
                    await interaction.reply({
                        content: 'The provided Discord user and member UUID do not match.',
                        ephemeral: true,
                    });
                    return;
                }
                targetMemberUUID = memberUUID;
            } else {
                targetMemberUUID = await getUUIDByDiscordId(targetDiscordId);
                if (!targetMemberUUID) {
                    await interaction.reply({
                        content: 'Could not find a member UUID associated with the provided Discord user.',
                        ephemeral: true,
                    });
                    return;
                }
            }
        } else if (memberUUID) {
            targetMemberUUID = memberUUID;
            targetDiscordId = await getDiscordIdByMemberUUID(targetMemberUUID);
            if (!targetDiscordId) {
                await interaction.reply({
                    content: 'Could not find a Discord user associated with the provided member UUID.',
                    ephemeral: true,
                });
                return;
            }
        }
    } catch (error) {
        console.error('Error resolving member identifiers:', error);
        await interaction.reply({
            content: 'An error occurred while resolving member identifiers.',
            ephemeral: true,
        });
        return;
    }

    // Proceed with synchronization based on syncType
    try {
        switch (syncType) {
            case 'discord-to-backend':
                await syncDiscordToBackend(targetDiscordId, targetMemberUUID);
                break;
            case 'backend-to-discord':
                await syncBackendToDiscord(targetDiscordId, targetMemberUUID);
                break;
            case 'both':
                await syncBothWays(targetDiscordId, targetMemberUUID);
                break;
            default:
                await interaction.reply({
                    content: 'Invalid sync type selected.',
                    ephemeral: true,
                });
                return;
        }

        await interaction.reply({
            content: `Synchronization (${syncType}) completed successfully for member <@${targetDiscordId}> (UUID: ${targetMemberUUID}).`,
            ephemeral: false,
        });
    } catch (error) {
        console.error(`Error during synchronization (${syncType}):`, error);
        await interaction.reply({
            content: `An error occurred during synchronization: ${error.message}`,
            ephemeral: true,
        });
    }
}

export default {
    data,
    execute,
};
