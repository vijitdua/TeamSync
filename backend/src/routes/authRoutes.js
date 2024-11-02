import {Router} from 'express';
import {isAuthenticatedController, loginController, signupController} from "../controller/authController.js";
import {authRateLimit} from "../middleware/rateLimit.js";

const router = Router();

router.post('/login', authRateLimit, loginController);
router.post('/signup', authRateLimit, signupController);
router.get('/check', authRateLimit, isAuthenticatedController);

export default router;