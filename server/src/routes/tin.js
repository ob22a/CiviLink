import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import checkIdsUploaded from "../middleware/checkIdsUploaded.js";
import { submitTinApplication } from "../controllers/tinController.js";

const router = express.Router();

router.post(
  "/applications",
  verifyToken,
  authorizeRoles("citizen"),
  checkIdsUploaded,
  submitTinApplication
);

export default router;
