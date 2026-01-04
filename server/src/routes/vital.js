import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import checkIdsUploaded from "../middleware/checkIdsUploaded.js";
import { submitVitalApplication, approveVitalApplication } from "../controllers/vitalController.js";
import {assignApproverOfficer} from "../middleware/assignOfficer.js";

const router = express.Router();

router.post(
  "/:type/applications",
  verifyToken,
  authorizeRoles("citizen"),
  checkIdsUploaded,
  assignApproverOfficer,
  submitVitalApplication
);

router.post(
  "/:type/applications/:id/approve",
  verifyToken,
  authorizeRoles("officer"),
  approveVitalApplication
);

export default router;
