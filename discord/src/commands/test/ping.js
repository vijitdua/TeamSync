import {SlashCommandBuilder} from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

export async function execute(interaction) {
    await interaction.reply({
        content: 'Pong!',
        ephemeral: false // Message visibility set to only the executioner of command or everyone
    });
}