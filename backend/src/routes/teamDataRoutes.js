import {Router} from "express";
import {isAuthenticatedUser} from "../controller/authController.js";
import {
    createTeamController,
    getAllTeamsController,
    getTeamController,
    deleteTeamController,
    updateTeamController
} from "../controller/teamDataController.js";

const router = Router();

router.post('/', isAuthenticatedUser, createTeamController);
router.get('/', isAuthenticatedUser, getAllTeamsController);
router.get('/:id', isAuthenticatedUser, getTeamController);
router.delete('/:id', isAuthenticatedUser, deleteTeamController);
router.put('/:id', isAuthenticatedUser, updateTeamController);

export default router;