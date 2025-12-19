import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import checkIdsUploaded from "../middleware/checkIdsUploaded.js";
import { submitVitalApplication } from "../controllers/vitalController.js";

const router = express.Router();

router.post(
  "/:type/applications",
  verifyToken,
  authorizeRoles("citizen"),
  checkIdsUploaded,
  submitVitalApplication
);

export default router;
