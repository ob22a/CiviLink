import express from 'express';
import { verifyToken } from "../middleware/authMiddleware.js";
import idUploadRoutes from "./idUpload.route.js";
import { getUserInfo, changePassword } from "../controllers/user.controller.js";


const router = express.Router();

router.use(verifyToken);

router.get('/profile',getUserInfo);
router.patch('/change-password',changePassword);

router.use('/id',idUploadRoutes);

export default router;
