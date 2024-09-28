import { Client, Events, GatewayIntentBits } from 'discord.js';
import { env } from './config/env.js';
import registerCommands from './config/discordSlashCommand.js';
import {auth} from "./services/auth.js";
import {deleteAllMembers, reinitializeMembers} from "./services/discordMemberDirectoryService.js";
import {deleteAllRoles, reinitializeRoles} from "./services/discordRoleDirectoryService.js";
import {setupMemberEvents} from "./events/memberEvents.js";
import {setupRoleEvents} from "./events/roleEvents.js"; // Import the registration script

// Client configuration
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

// Client login and slash command registration
client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    // Login to the backend
    await auth();

    // Delete all members and roles on first login
    await deleteAllMembers();
    await deleteAllRoles();

    // Reinitialize members and roles
    const guild = client.guilds.cache.first(); // Get the first guild the bot is connected to
    if (guild) {
        await reinitializeMembers(guild);
        await reinitializeRoles(guild);
    } else {
        console.error('No guild found for reinitialization');
    }

    // Set up event listeners for real-time updates
    setupMemberEvents(client);
    setupRoleEvents(client);

    // Register slash commands when the bot is ready
    await registerCommands(client);
});

// Handle Slash Commands
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Start client
client.login(env.discordBotToken);

export default client;
