import { SlashCommandBuilder } from 'discord.js';
import {
    syncMemberDiscordTeamsByRolesToDatabase,
    syncMemberTeamsByDatabaseToDiscordRoles,
    syncMemberDiscordToBackendAndBackendToDiscord,
} from '../../services/syncService.js';
import { env } from '../../config/env.js';
import { getDiscordIdByMemberUUID } from '../../services/memberService.js';

export const data = new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Synchronize member data between Discord and backend.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('discord-to-backend')
            .setDescription('Sync data from Discord to backend.')
            .addUserOption((option) =>
                option
                    .setName('user')
                    .setDescription('The Discord user to sync.')
                    .setRequired(false)
            )
            .addStringOption((option) =>
                option
                    .setName('uuid')
                    .setDescription('The UUID of the member to sync.')
                    .setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('backend-to-discord')
            .setDescription('Sync data from backend to Discord.')
            .addUserOption((option) =>
                option
                    .setName('user')
                    .setDescription('The Discord user to sync.')
                    .setRequired(false)
            )
            .addStringOption((option) =>
                option
                    .setName('uuid')
                    .setDescription('The UUID of the member to sync.')
                    .setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('both')
            .setDescription('Sync data both ways.')
            .addUserOption((option) =>
                option
                    .setName('user')
                    .setDescription('The Discord user to sync.')
                    .setRequired(false)
            )
            .addStringOption((option) =>
                option
                    .setName('uuid')
                    .setDescription('The UUID of the member to sync.')
                    .setRequired(false)
            )
    );

export async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user');
    const memberUUID = interaction.options.getString('uuid');

    let discordMemberId;

    // Determine the target member
    if (targetUser) {
        discordMemberId = targetUser.id;
    } else if (memberUUID) {
        // Fetch Discord ID using the provided UUID
        discordMemberId = await getDiscordIdByMemberUUID(memberUUID);
        if (!discordMemberId) {
            await interaction.reply({
                content: `Could not find a Discord user associated with UUID ${memberUUID}.`,
                ephemeral: true,
            });
            return;
        }
    } else {
        // If neither 'user' nor 'uuid' is provided, default to the command invoker
        discordMemberId = interaction.member.id;
    }

    // Permissions check: Ensure the user has the required role or permissions
    if (!interaction.member.permissions.has('Administrator')) {
        await interaction.reply({
            content: 'You do not have permission to use this command.',
            ephemeral: true,
        });
        return;
    }

    try {
        if (subcommand === 'discord-to-backend') {
            await syncMemberDiscordTeamsByRolesToDatabase(discordMemberId);
            await interaction.reply({
                content: `Synchronization from Discord to backend completed for user <@${discordMemberId}>.`,
                ephemeral: true,
            });
        } else if (subcommand === 'backend-to-discord') {
            await syncMemberTeamsByDatabaseToDiscordRoles(discordMemberId);
            await interaction.reply({
                content: `Synchronization from backend to Discord completed for user <@${discordMemberId}>.`,
                ephemeral: true,
            });
        } else if (subcommand === 'both') {
            await syncMemberDiscordToBackendAndBackendToDiscord(discordMemberId);
            await interaction.reply({
                content: `Synchronization between Discord and backend completed for user <@${discordMemberId}>.`,
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: 'Unknown subcommand.',
                ephemeral: true,
            });
        }
    } catch (error) {
        console.error(`Error executing sync command: ${error.message}`);
        // Check if the interaction has already been replied to
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: `There was an error during synchronization: ${error.message}`,
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: `There was an error during synchronization: ${error.message}`,
                ephemeral: true,
            });
        }
    }
}