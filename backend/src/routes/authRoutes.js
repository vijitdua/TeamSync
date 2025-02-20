import {Router} from 'express';
import {isAuthenticatedController, loginController, signupController} from "../controller/authController.js";
import {authRateLimit} from "../middleware/rateLimit.js";

const router = Router();

// temp route for development used to check cookie yeah!
router.get('/cookie', (req, res)=>{
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        console.log("no cookies sent by frontend");
        return res.status(400).send("no cookies found");
    }

    console.log("cookie header:", cookieHeader);
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, val] = cookie.trim().split('=');
        acc[key] = val;
        return acc;
    }, {});

    if (cookies["connect.sid"]) {
        console.log("value of connect.sid:", cookies["connect.sid"]);
    } else {
        console.log("connect.sid is not set");
    }

    res.status(200).send("cookie value printed in console.");
});

router.post('/login', authRateLimit, loginController);
router.post('/signup', authRateLimit, signupController);
router.get('/check', isAuthenticatedController);

export default router;