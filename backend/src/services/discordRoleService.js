import { discordGuildRoleModel } from "../models/discordGuildRoleModel.js";

export async function createRole(data) {
    return await discordGuildRoleModel.create(data);
}

export async function getAllRoles() {
    return await discordGuildRoleModel.findAll();
}

export async function getRoleByID(discordRoleID) {
    return await discordGuildRoleModel.findOne({ where: { discordRoleID } });
}
