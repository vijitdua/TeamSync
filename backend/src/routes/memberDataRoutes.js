import {Router} from "express";
import {isAuthenticatedUserMiddleware} from "../controller/authController.js";
import {
    createMemberController,
    deleteMemberController,
    getAllMembersController, getMemberByDiscordIdController,
    getMemberController, getMemberImageController,
    updateMemberController, uploadMemberImageController
} from "../controller/memberDataController.js";

const router = Router();

// Fully public route
router.get('/image/:filename', getMemberImageController);
router.get('/', getAllMembersController);
router.get('/discord/:discordId', getMemberByDiscordIdController)

// Semi-Public routes (data might differ based on auth state which is checked inside controllers)
router.get('/:id', getMemberController);

// Private routes
router.post('/', isAuthenticatedUserMiddleware, createMemberController);
router.delete('/:id', isAuthenticatedUserMiddleware, deleteMemberController);
router.put('/:id', isAuthenticatedUserMiddleware, updateMemberController);
router.post('/image', isAuthenticatedUserMiddleware, uploadMemberImageController);


export default router;