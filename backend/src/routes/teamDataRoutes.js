import {Router} from "express";
import {isAuthenticatedUserMiddleware} from "../controller/authController.js";
import {
    createTeamController,
    getAllTeamsController,
    getTeamController,
    deleteTeamController,
    updateTeamController,
    uploadTeamImageController,
    getTeamImageController, getTeamByDiscordIdController
} from "../controller/teamDataController.js";


const router = Router();

// Fully public route
router.get('/', getAllTeamsController);
router.get('/discord/:discordId', getTeamByDiscordIdController);
router.get('/image/:filename', getTeamImageController);

// Semi-Public routes (data might differ based on auth state which is checked inside controllers)
router.get('/:id', getTeamController);

// Private routes
router.post('/', isAuthenticatedUserMiddleware, createTeamController);
router.delete('/:id', isAuthenticatedUserMiddleware, deleteTeamController);
router.put('/:id', isAuthenticatedUserMiddleware, updateTeamController);
router.post('/image', isAuthenticatedUserMiddleware, uploadTeamImageController);


export default router;