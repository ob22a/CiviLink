import express from "express";
import passport from "passport";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  register,
  login,
  logout,
  refreshToken,
  oauthHandler
} from "../controllers/authController.js";

const router = express.Router();

//Citizen registration
router.post("/register", register);

//Login
router.post("/login", login);

// Register or login with Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}))

// Callback route for Google to redirect to
router.get(
  "/google/callback",
  passport.authenticate('google', {
    // failureRedirect: '/register',
    session: false // Disables session management for this request
  }),
  oauthHandler
)

//Logout
router.post("/logout", verifyToken, logout);

//Refresh access token
router.post("/refresh-token", refreshToken);

export default router;
