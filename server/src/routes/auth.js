import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import authController from "../controllers/authController.js";

const router = express.Router();

//Citizen registration
router.post("/register", authController.register);

//Login
router.post("/login", authController.login);

//Logout
router.post("/logout", verifyToken, authController.logout);

//Refresh access token
router.post("/refresh", authController.refreshToken);
