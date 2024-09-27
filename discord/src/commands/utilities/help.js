import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lists all available commands.');

export async function execute(interaction) {
    const commands = interaction.client.commands;

    // Build the help message
    let helpMessage = 'Here are all the available commands:\n\n';
    commands.forEach((command) => {
        helpMessage += `**/${command.data.name}** - ${command.data.description}\n`;
    });

    // Send the help message as an ephemeral response so only the user can see it
    await interaction.reply({
        content: helpMessage,
        ephemeral: true // This makes the help message visible only to the user
    });
}
