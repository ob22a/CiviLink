import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import checkIdsUploaded from "../middleware/checkIdsUploaded.js";
import { submitTinApplication, approveTinApplicatin, rejectTinApplication } from "../controllers/tinController.js";
import {assignApproverOfficer} from "../middleware/assignOfficer.js";

const router = express.Router();

router.post(
  "/applications",
  verifyToken,
  authorizeRoles("citizen"),
  checkIdsUploaded,
  assignApproverOfficer,
  submitTinApplication
);

router.post(
  "/applications/:id/approve",
  verifyToken,
  authorizeRoles("officer"),
  approveTinApplicatin
);

router.post(
  "/applications/:id/reject",
  verifyToken,
  authorizeRoles("officer"),
  rejectTinApplication
)

export default router;
