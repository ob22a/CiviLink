import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import checkIdsUploaded from "../middleware/checkIdsUploaded.js";
import { getAllApplications, downloadCertificate } from "../controllers/applicationsController.js"

const router = express.Router();

router.get(
    '/',
    verifyToken,
    authorizeRoles("citizen"),
    // checkIdsUploaded,
    getAllApplications
);

router.get(
    '/:id/download',
    verifyToken,
    authorizeRoles("citizen"),
    // checkIdsUploaded,
    downloadCertificate
);

export default router;