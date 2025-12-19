import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import checkIdsUploaded from "../middleware/checkIdsUploaded.js";
import { submitVitalApplication } from "../controllers/vitalController.js";
import assignOfficer from "../middleware/assignOfficer.js";

const router = express.Router();

router.post(
  "/:type/applications",
  verifyToken,
  authorizeRoles("citizen"),
  checkIdsUploaded,
  assignOfficer,
  submitVitalApplication
);

export default router;
