import express from "express";
import { upload } from "../utils/uploadConfig.js";
import { faydaOCR, kebeleOCR, getIDUploadStatus } from "../controllers/idUploadController.js";  
import { deleteIdInfo } from "../controllers/user.controller.js";

const router = express.Router();

router.get('/upload', getIDUploadStatus)

router.post("/upload/fayda", upload.single("id_image"), faydaOCR);

router.post("/upload/kebele", upload.single("id_image"), kebeleOCR);

router.delete('/:idType', deleteIdInfo);


export default router;