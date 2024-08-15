import {Router} from "express";
import {isAuthenticatedUser} from "../controller/authController.js";
import {
    createMemberController,
    deleteMemberController,
    getAllMembersController,
    getMemberController,
    updateMemberController
} from "../controller/memberDataController.js";

const router = Router();

router.post('/', isAuthenticatedUser, createMemberController);
router.get('/', isAuthenticatedUser, getAllMembersController);
router.get('/:id', isAuthenticatedUser, getMemberController);
router.delete('/:id', isAuthenticatedUser, deleteMemberController);
router.put('/:id', isAuthenticatedUser, updateMemberController);

export default router;