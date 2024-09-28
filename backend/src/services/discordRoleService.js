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

// Delete a specific role by ID
export async function deleteRoleByID(discordRoleID) {
    return await discordGuildRoleModel.destroy({ where: { discordRoleID } });
}

// Delete all roles
export async function deleteAllRoles() {
    return await discordGuildRoleModel.destroy({ where: {} });
}
