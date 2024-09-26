import {Router} from 'express';
import {isAuthenticatedUser, loginController, signupController} from "../controller/authController.js";

const router = Router();

router.post('/login' , loginController);
router.post('/signup', signupController);

export default router;