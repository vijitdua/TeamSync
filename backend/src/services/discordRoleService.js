import { discordGuildRoleModel } from "../models/discordGuildRoleModel.js";

export async function createRole(data) {
    return await discordGuildRoleModel.create(data);
}

export async function getAllRoles() {
    const roles = await discordGuildRoleModel.findAll({ attributes: ['discordID'] });
    return roles.map(role => role.discordID);  // Return an array of role UUIDs
}

export async function getRoleByID(discordRoleID) {
    return await discordGuildRoleModel.findOne({ where: { discordRoleID } });
}