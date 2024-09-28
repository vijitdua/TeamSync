import {getAllRoles, getRoleByID, createRole, deleteAllRoles, deleteRoleByID} from "../services/discordRoleService.js";

export async function createRoleController(req, res) {
    try {
        const newRole = await createRole(req.body);
        res.status(200).json({ success: true, data: newRole });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

export async function getAllRolesController(req, res) {
    try {
        const roles = await getAllRoles();
        res.status(200).json({ success: true, data: roles });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

export async function getRoleByIDController(req, res) {
    try {
        const { discordRoleID } = req.params;
        const role = await getRoleByID(discordRoleID);
        if (!role) throw new Error("Role not found");
        res.status(200).json({ success: true, data: role });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// Delete a specific role by ID
export async function deleteRoleByIDController(req, res) {
    try {
        const { discordRoleID } = req.params;
        const deleted = await deleteRoleByID(discordRoleID);
        if (!deleted) throw new Error("Role not found");
        res.status(200).json({ success: true, message: "Role deleted successfully" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// Delete all roles
export async function deleteAllRolesController(req, res) {
    try {
        await deleteAllRoles();
        res.status(200).json({ success: true, message: "All roles deleted successfully" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}
