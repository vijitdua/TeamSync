import express, {Router} from "express";
import {isAuthenticatedUserMiddleware} from "../controller/authController.js";
import {
    createMemberController,
    deleteMemberController,
    getAllMembersController,
    getMemberController, getMemberImageController,
    updateMemberController, uploadMemberImageController
} from "../controller/memberDataController.js";
import {join} from "path";
import {env} from "../config/env.js";

const router = Router();

router.post('/', isAuthenticatedUserMiddleware, createMemberController);
router.get('/', isAuthenticatedUserMiddleware, getAllMembersController);
router.get('/:id', isAuthenticatedUserMiddleware, getMemberController);
router.delete('/:id', isAuthenticatedUserMiddleware, deleteMemberController);
router.put('/:id', isAuthenticatedUserMiddleware, updateMemberController);

router.post('/image', isAuthenticatedUserMiddleware, uploadMemberImageController);
router.get('/image/:filename', (req,res, next)=>{
    console.log(join(env.root_location, 'memberImage', 'test.png'));
    next();
}, getMemberImageController);

export default router;