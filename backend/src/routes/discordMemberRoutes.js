import { Router } from "express";
import { isAuthenticatedUserMiddleware } from "../controller/authController.js";
import {
    createMemberController,
    getMemberByUsernameController,
    getAllMembersIDsController,
    getMemberByIDController
} from "../controller/discordMemberController.js";

const router = Router();

// Private Routes
router.post('/', isAuthenticatedUserMiddleware, createMemberController);

// Public Routes
router.get('/', getAllMembersIDsController);
router.get('/username/:discordUsername', getMemberByUsernameController);
router.get('/:discordID', getMemberByIDController);

export default router;
