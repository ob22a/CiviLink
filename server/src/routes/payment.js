import {
  getPaymentHistory,
  getPaymentStatus,
  downloadReceipt,
  processPayment,
  verifyPayment,
} from "../controllers/paymentController";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import express from "express";
const router = express.Router();

router.post("/pay", verifyToken, authorizeRoles("citizen"), processPayment);

router.get("/:id/status", verifyToken, getPaymentStatus);

router.get(
  "/history",
  verifyToken,
  authorizeRoles("citizen", "admin"),
  getPaymentHistory
);

router.get(
  "/:id/receipt",
  verifyToken,
  authorizeRoles("citizen", "admin"),
  downloadReceipt
);

router.get("/verify/:txRef", verifyToken, verifyPayment);

export default router;
