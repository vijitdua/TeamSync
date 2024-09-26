import {
    getAllTeams,
    getTeam,
    addTeam,
    updateTeam,
    deleteTeam,
    uploadTeamImage,
    getTeamImage
} from "../services/teamDataService.js";

/**
 * Controller that gets all teams
 * When successful, sends status 200 and JSON with success and list of all team IDs
 * When unsuccessful, sends 400 status with false success and an error message
 */
export async function getAllTeamsController(req, res) {
    try {
        const teams = await getAllTeams();  // Fetch all teams

        res.status(200).json({
            success: true,
            data: teams,
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message,
        })
    }
}

/**
 * Controller that creates a new team
 * When successful, sends status 200 with data of created team
 * When unsuccessful, sends 400 status with false success and an error message
 */
export async function createTeamController(req, res) {
    try {
        const newTeam = await addTeam(req.body);  // Use the request body data to create a new team

        res.status(200).json({
            success: true,
            data: newTeam,
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}

/**
 * Controller that gets a specific team
 * When successful, sends status 200 with data of the selected team
 * When unsuccessful, sends 400 status with false success and an error message
 */
export async function getTeamController(req, res) {
    try {
        const id = req.params.id;  // Get team ID from request parameters
        const team = await getTeam(id);

        if (!team) {
            throw Error("Team not found");
        }

        res.status(200).json({
            success: true,
            data: team,
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}

/**
 * Controller that updates a specific team with data from the request body
 * When successful, sends status 200 with data of the selected team
 * When unsuccessful, sends 400 status with false success and an error message
 */
export async function updateTeamController(req, res) {
    try {
        const id = req.params.id;  // Get team ID from request parameters
        const team = await updateTeam(id, req.body);

        res.status(200).json({
            success: true,
            data: team,
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}

/**
 * Controller that "deletes" (fake-deletes) a specific team
 * When successful, sends status 200 with data of the selected team
 * When unsuccessful, sends 400 status with false success and an error message
 */
export async function deleteTeamController(req, res) {
    try {
        const id = req.params.id;  // Get team ID from request parameters
        const deleted = await deleteTeam(id);  // "Delete" the team

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

export async function uploadTeamImageController(req, res) {
    try {
        await new Promise((resolve, reject) => {
            uploadTeamImage(req, res, function (err) {
                if (res.headersSent) {
                    return;
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

        if (!req.file) {
            throw new Error('No file uploaded');
        }
        return res.status(200).json({
            success: true,
            file: `/teamImage/${req.file.filename}`,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

export async function getTeamImageController(req, res) {
    try {
        res.sendFile(getTeamImage(req.params.filename), function (err) {
            if (err) {
                res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}
