import express from "express";
import {
  getSecurityLogs,
  exportSecurityLogsController,
  downloadExportedFile,
} from "../controllers/securityController";
import { authorizeRoles } from "../middleware/authMiddleware";

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
