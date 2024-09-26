import {Router} from "express";
import {isAuthenticatedUserMiddleware} from "../controller/authController.js";
import {
    createTeamController,
    getAllTeamsController,
    getTeamController,
    deleteTeamController,
    updateTeamController,
    uploadTeamImageController,
    getTeamImageController
} from "../controller/teamDataController.js";


const router = Router();

router.post('/', isAuthenticatedUserMiddleware, createTeamController);
router.get('/', isAuthenticatedUserMiddleware, getAllTeamsController);
router.get('/:id', isAuthenticatedUserMiddleware, getTeamController);
router.delete('/:id', isAuthenticatedUserMiddleware, deleteTeamController);
router.put('/:id', isAuthenticatedUserMiddleware, updateTeamController);
router.post('/image', isAuthenticatedUserMiddleware, uploadTeamImageController);
router.get('/image/:filename', getTeamImageController);


export default router;