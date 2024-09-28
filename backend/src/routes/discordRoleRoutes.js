import {Router} from "express";
import {isAuthenticatedUserMiddleware} from "../controller/authController.js";
import {
    createRoleController, deleteAllRolesController, deleteRoleByIDController,
    getAllRolesController,
    getRoleByIDController
} from "../controller/discordRoleController.js";

const router = Router();

// Private routes
router.post('/', isAuthenticatedUserMiddleware, createRoleController);
router.delete('/:discordRoleID', isAuthenticatedUserMiddleware, deleteRoleByIDController);
router.delete('/', isAuthenticatedUserMiddleware, deleteAllRolesController);

// Public routes
router.get('/', getAllRolesController);
router.get('/:discordRoleID', getRoleByIDController);

export default router;
