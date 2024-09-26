import {
    getAllMembers,
    getMember,
    addMember,
    updateMember,
    deleteMember, uploadMemberImage, getMemberImage
} from "../services/memberDataService.js";

/**
 * Controller that gets all members
 * When successful, sends status 200 and JSON with success and list of all member IDs
 * When unsuccessful, sends 400 status with false success and an error message
 */
export async function getAllMembersController(req, res) {
    try {
        const members = await getAllMembers();  // Fetch all members from organizationMemberModel

        res.status(200).json({
            success: true,
            data: members,
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message,
        })
    }
}

/**
 * Controller that creates a new member
 * When successful, sends status 200 with data of created member
 * When unsuccessful, sends 400 status with false success and an error message
 */
export async function createMemberController(req, res) {
    try {
        const newMember = await addMember(req.body);  // Use the request body data to create a new member

        res.status(200).json({
            success: true,
            data: newMember,
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}

/**
 * Controller that gets a specific member
 * When successful, sends status 200 with data of the selected member
 * When unsuccessful, sends 400 status with false success and an error message
 */
export async function getMemberController(req, res) {
    try {
        const id = req.params.id;  // Get member ID from request parameters
        const member = await getMember(id);  // Member ID is the primary key used to find a member

        if (!member) {
            throw Error("Member not found");
        }

        res.status(200).json({
            success: true,
            data: member,
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}

/**
 * Controller that updates a specific member with data from the request body
 * When successful, sends status 200 with data of the selected member
 * When unsuccessful, sends 400 status with false success and an error message
 */
export async function updateMemberController(req, res) {
    try {
        const id = req.params.id;  // Get member ID from request parameters
        const member = await updateMember(id, req.body);

        res.status(200).json({
            success: true,
            data: member,
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}

/**
 * Controller that "deletes" (fake-deletes) a specific member
 * When successful, sends status 200 with data of the selected member
 * When unsuccessful, sends 400 status with false success and an error message
 */
export async function deleteMemberController(req, res) {
    try {
        const id = req.params.id;  // Get member ID from request parameters
        const deleted = await deleteMember(id);  // "Delete" the member

        res.status(200).json({
            success: true,
            data: deleted,
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}

export async function uploadMemberImageController(req, res) {
    try {

        await new Promise((resolve, reject) => {
            uploadMemberImage(req, res, function (err) {
                if (res.headersSent) {
                    return; // Avoid crash when attaching files in invalid fields
                }
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload image',
                        error: err.message,
                    });
                } else {
                    resolve();
                }
            });
        });

        if(!req.file){
            throw new Error('No file uploaded');
        }
        return res.status(200).json({
            success: true,
            file: `/memberImage/${req.file.filename}`,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

export async function getMemberImageController(req, res) {
    try{
        res.sendFile(getMemberImage(req.params.filename), function (err){
            if(err){
                res.status(400).json({
                    success: false,
                    message: err.message,
                })
            }
        });
    }catch(err){
        res.status(400).json({
            success: false,
            message: err.message,
        })
    }
}