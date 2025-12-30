import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { searchUser, assignOfficer, createAdmin } from "../controllers/adminController.js";
import { getPerformanceMetrics, getOfficerPerformance } from "../controllers/analyticsController.js";
import { exportPerformanceReport } from "../controllers/analyticsExportController.js";

const router = express.Router();

router.post(
    "/create",
    createAdmin
); // Only one admin is created and this route is called during initial setup. After this we can log in with the admin and use it for testing in postman. It needs to be above the verifyToken middleware.

router.use(verifyToken);

router.get(
    "/user",
    authorizeRoles('admin'),
    searchUser
);

router.post(
    "/officers/assign",
    authorizeRoles("admin"),
    assignOfficer
);

// Analytics Routes
router.get(
    "/metrics/performance",
    authorizeRoles("admin"),
    getPerformanceMetrics
);

router.get(
    "/metrics/officers",
    authorizeRoles("admin"),
    getOfficerPerformance
);

router.get(
    "/metrics/performance/download",
    authorizeRoles("admin"),
    exportPerformanceReport
);

export default router;