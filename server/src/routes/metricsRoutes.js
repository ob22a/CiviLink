import express from "express";
import {
  getSecurityLogs,
  exportSecurityLogsController,
  downloadExportedFile,
} from "../controllers/securityController.js";
import { authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/security", authorizeRoles("admin"), getSecurityLogs);
router.get(
  "/security/export",
  authorizeRoles("admin"),
  exportSecurityLogsController
);
router.get(
  "/security/download/:filename",
  authorizeRoles("admin"),
  downloadExportedFile
);

export default router;
