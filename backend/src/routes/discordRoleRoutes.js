import { Router } from "express";
import { isAuthenticatedUserMiddleware } from "../controller/authController.js";
import {
    createRoleController,
    getAllRolesController,
    getRoleByIDController
} from "../controller/discordRoleController.js";

const router = Router();

// Private routes
router.post('/', isAuthenticatedUserMiddleware, createRoleController);

// Public routes
router.get('/', getAllRolesController);
router.get('/:discordRoleID', getRoleByIDController);

export default router;
