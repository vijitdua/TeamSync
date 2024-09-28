import { discordGuildMemberModel } from "../models/discordGuildMemberModel.js";

export async function createMember(data) {
    return await discordGuildMemberModel.create(data);
}

export async function getMemberByUsername(discordUsername) {
    return await discordGuildMemberModel.findOne({ where: { discordUsername } });
}

export async function getAllMembersIDs() {
    const members = await discordGuildMemberModel.findAll({ attributes: ['discordID'] });
    return members.map(member => member.discordID);  // Return an array of member UUIDs
}

export async function getMemberByID(discordID) {
    return await discordGuildMemberModel.findOne({ where: { discordID } });
}

// Delete a specific member by ID
export async function deleteMemberByID(discordID) {
    return await discordGuildMemberModel.destroy({ where: { discordID } });
}

// Delete all members
export async function deleteAllMembers() {
    return await discordGuildMemberModel.destroy({ where: {} });
}
