import {Router} from 'express';
import {isAuthenticatedUser, loginController, signupController} from "../controller/authController.js";

const router = Router();

router.post('/login' , loginController);
router.post('/signup', signupController);

export default router;

// (req,res,next) =>{
//     if(isAuthenticatedUser(req)){
//         res.status(200).json({message: 'Already authenticated'});
//     }
//     else{
//         next();
//     }
// }