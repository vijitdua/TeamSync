import {
    createMember,
    getMemberByUsername,
    getAllMembersIDs,
    getMemberByID
} from "../services/discordMemberService.js";

export async function createMemberController(req, res) {
    try {
        const newMember = await createMember(req.body);
        res.status(200).json({ success: true, data: newMember });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

export async function getMemberByUsernameController(req, res) {
    try {
        const { discordUsername } = req.params;
        const member = await getMemberByUsername(discordUsername);
        if (!member) throw new Error("Member not found");
        res.status(200).json({ success: true, data: member });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

export async function getAllMembersIDsController(req, res) {
    try {
        const ids = await getAllMembersIDs();
        res.status(200).json({ success: true, data: ids });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

export async function getMemberByIDController(req, res) {
    try {
        const { discordID } = req.params;
        const member = await getMemberByID(discordID);
        if (!member) throw new Error("Member not found");
        res.status(200).json({ success: true, data: member });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}
