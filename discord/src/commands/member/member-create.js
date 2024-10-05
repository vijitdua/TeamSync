import { SlashCommandBuilder } from 'discord.js';
import { createMember } from '../../services/memberService.js';
import { getTeamUUIDByDiscordRoleId } from '../../services/teamService.js';  // Service to fetch team UUIDs

/**
 * Data builder for the /member-create command. Defines the command name, description,
 * and the input options (member name, position, join date, profile picture, phone number, email, Discord mention, and roles).
 */
export const data = new SlashCommandBuilder()
    .setName('member-create')
    .setDescription('Create a new member')
    // Required options first
    .addStringOption(option =>
        option.setName('name')
            .setDescription('The name of the member')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('position')
            .setDescription('The position of the member')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('joindate')
            .setDescription('The join date in YYYY-MM-DD format')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('email')
            .setDescription('The email of the member')
            .setRequired(true))
    .addUserOption(option =>
        option.setName('discordmention')
            .setDescription('Mention the Discord user to get their Discord ID')
            .setRequired(true))
    // This is for the list of team mentions (Discord roles)
    .addRoleOption(option =>
        option.setName('roles')
            .setDescription('Mention the roles (teams) that the member belongs to')
            .setRequired(false))
    // Non-required options afterward
    .addStringOption(option =>
        option.setName('profilepicture')
            .setDescription('The URL to the member\'s profile picture')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('phonenumber')
            .setDescription('The phone number of the member')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('notes')
            .setDescription('Admin notes for the member')
            .setRequired(false));

/**
 * Executes the /member-create command.
 *
 * @param {CommandInteraction} interaction - The interaction object representing the command and its arguments.
 * @returns {Promise<void>}
 *
 * This function gathers the user's input, converts Discord roles (team mentions) into team UUIDs,
 * and sends the data to the backend to create a new member.
 */
export async function execute(interaction) {
    const name = interaction.options.getString('name');
    const position = interaction.options.getString('position');
    const joinDate = interaction.options.getString('joindate');
    const profilePicture = interaction.options.getString('profilepicture') || 'https://example.com/default-profile.png';  // Default profile picture
    const phoneNumber = interaction.options.getString('phonenumber') || null;
    const email = interaction.options.getString('email');
    const mentionedUser = interaction.options.getUser('discordmention');  // Get the mentioned Discord user
    const discordId = mentionedUser.id;  // Automatically get the Discord ID from the mention
    const roles = interaction.options.getRole('roles') ? [interaction.options.getRole('roles')] : [];  // Get the mentioned roles (teams)
    const notes = interaction.options.getString('notes') || 'No notes provided';

    // Initialize an empty array to store the team UUIDs
    const teamUUIDs = [];

    // Convert each role (Discord team mention) into a team UUID by querying the backend
    for (const role of roles) {
        const teamUUID = await getTeamUUIDByDiscordRoleId(role.id);
        if (teamUUID) {
            teamUUIDs.push(teamUUID);  // Push the valid team UUID to the array
        }
    }

    const memberData = {
        name,
        position,
        joinDate,
        profilePicture,
        phoneNumber,
        email,
        discordId,  // Use the automatically extracted Discord ID
        teams: teamUUIDs,  // Assign the list of team UUIDs
        notes,
        customDataPublic: {},  // Optional custom public data
        customDataPrivate: {}  // Optional custom private data
    };

    const result = await createMember(memberData);

    if (result.success) {
        await interaction.reply(result.message);  // Success response
    } else {
        await interaction.reply({ content: `Error: ${result.message}`, ephemeral: true });  // Error response (ephemeral for privacy)
    }
}