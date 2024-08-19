import {
    getAllTeams, 
    getTeam,
    addTeam,
    updateTeam,
    deleteTeam
} from "../services/teamDataService"

export async function getAllTeamsController(req, res) {
    try{
        const teams = await getAllTeams();  // Fetch all teams

        res.status(200).json({
            success: true,
            data: teams,
        });
        
    }catch(err){
        res.status(400).json({
            success: false, 
            error: err.message, 
        })
    }
}

export async function createTeamController(req, res){
    try{
        const newTeam = await addTeam(req.body);  // Use the request body data to create a new team

        res.status(200).json({
            success: true, 
            data: newTeam,
        })
    }catch(err){
        res.status(400).json({
            success: false, 
            message: err.message, 
        });
    }
}

export async function getTeamController(req, res){
    try{
        const id = req.params.id;  // Get team ID from request parameters
        const team = getTeam(id);

        if (!team) {
            throw Error("Team not found");
        }

        res.status(200).json({
            success: true, 
            data: team,
        })
    }catch(err){
        res.status(400).json({
            success: false, 
            message: err.message, 
        });
    }
}

export async function updateTeamController(req, res){
    try{
        const id = req.params.id;  // Get team ID from request parameters
        const team = updateTeam(id, req.body);

        res.status(200).json({
            success: true, 
            data: team,
        })
    }catch(err){
        res.status(400).json({
            success: false, 
            message: err.message, 
        });
    }
}

export async function deleteTeamController(req, res){
    try{
        const id = req.params.id;  // Get team ID from request parameters
        const deleted = await deleteTeam(id);  // Delete the team
        
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