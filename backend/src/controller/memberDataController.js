import { organizationMemberModel } from "../models/organizationMemberModel.js";

/**
 * Controller that gets all members
 * When successful, sends status 200 with data of all members
 * When unsuccessful, sends 400 status with false success and an error message
 */
export async function getAllMembersController(req, res) {
    try{
        const members = await organizationMemberModel.findAll();  // Fetch all members from organizationMemberModel

        res.status(200).json({
            success: true,
            data: members,
        });
        
    }catch(err){
        res.status(400).json({
            success: false, 
            error: err.message, 
        })
    }
}

/**
 * Controller that gets all members
 * When successful, sends status 200 with data of all members
 * When unsuccessful, sends 400 status with false success and an error message
 */
export async function createMemberController(req, res){
    try{
        const newMember = await organizationMemberModel.create(req.body);  // Use the request body data to create a new member

        res.status(200).json({
            success: true, 
            data: newMember,
        })
    }catch(err){
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
export async function getMemberController(req, res){
    try{
        const id = req.params.id;  // Get member ID from request parameters
        const member = await organizationMemberModel.findByPk(id);  // Member ID is the primary key used to find a member

        if (!member) {
            throw Error("Member not found");
        }

        res.status(200).json({
            success: true, 
            data: member,
        })
    }catch(err){
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
export async function updateMemberController(req, res){
    try{
        const id = req.params.id;  // Get member ID from request parameters
        const member = await organizationMemberModel.findByPk(id);  // Member ID is the primary key used to find a member

        if (!member) {
            throw Error("Can't update because member not found");
        }

        member.set(req.body);  // Use the data in the request body to update the member
        await member.save();  // Persist changes in the database

        res.status(200).json({
            success: true, 
            data: member,
        })
    }catch(err){
        res.status(400).json({
            success: false, 
            message: err.message, 
        });
    }
}

/**
 * Controller that deletes a specific member
 * When successful, sends status 200 with data of the selected member
 * When unsuccessful, sends 400 status with false success and an error message
 */
export async function deleteMemberController(req, res){
    try{
        const id = req.params.id;  // Get member ID from request parameters
        const member = await organizationMemberModel.findByPk(id);  // Member ID is the primary key used to find a member
        await organizationMemberModel.destroy(member);  // Delete the member
        
        res.status(200).json({
            success: true, 
            data: deleted,
        })
    }catch(err){
        res.status(400).json({
            success: false, 
            message: err.message, 
        });
    }
}