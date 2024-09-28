import { Router } from "express";
import { isAuthenticatedUserMiddleware } from "../controller/authController.js";
import {
    createMemberController,
    getMemberByUsernameController,
    getAllMembersIDsController,
    getMemberByIDController, deleteAllMembersController, deleteMemberByIDController
} from "../controller/discordMemberController.js";

const router = Router();

// Private Routes
router.post('/', isAuthenticatedUserMiddleware, createMemberController);
router.delete('/:discordID', isAuthenticatedUserMiddleware, deleteMemberByIDController);
router.delete('/', isAuthenticatedUserMiddleware, deleteAllMembersController);


// Public Routes
router.get('/', getAllMembersIDsController);
router.get('/username/:discordUsername', getMemberByUsernameController);
router.get('/:discordID', getMemberByIDController);

export default router;
