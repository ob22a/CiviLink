import express from "express";
import { upload } from "../utils/uploadConfig.js";
import { faydaOCR, kebeleOCR, getIDUploadStatus } from "../controllers/idUploadController.js";  
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get('/upload', getIDUploadStatus)

router.post("/upload/fayda", upload.single("id_image"), faydaOCR);

router.post("/upload/kebele", upload.single("id_image"), kebeleOCR);

export default router;