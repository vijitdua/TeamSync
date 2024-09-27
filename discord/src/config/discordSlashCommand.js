// discordSlashCommand.js
import { Collection, REST, Routes } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { env } from './env.js';

async function registerCommands(client) {
    client.commands = new Collection();
    const foldersPath = path.join(env.srcLocation, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    // Import commands from the folder into client.commands
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = await import(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    // Register commands with Discord
    const rest = new REST().setToken(env.discordBotToken);
    try {
        console.log(`Started refreshing ${client.commands.size} application (/) commands.`);

        // Register the commands globally or to a guild
        const data = await rest.put(Routes.applicationCommands(env.discordApplicationClientID), {
            body: client.commands.map((command) => command.data.toJSON()),
        });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
}

export default registerCommands;
