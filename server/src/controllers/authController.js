import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ms from "ms";
import {
  isValidPassword,
  isValidFullName,
  isValidEmail,
} from "../utils/validators.js";
import { makeNotification } from "../utils/makeNotification.js";


const accessTokenMaxAge = ms(process.env.ACCESS_TOKEN_EXPIRES);
const refreshTokenMaxAge = ms(process.env.REFRESH_TOKEN_EXPIRES);

const isProduction = process.env.NODE_ENV === "production";

// User Registration and Login via Google
const oauthHandler = async (req, res) => {

  try {
    let user = await User.findById(req.user._id)

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    );

    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
      maxAge: accessTokenMaxAge,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
      maxAge: refreshTokenMaxAge,
    });

    // Redirect to frontend callback URL with success indicator
    const frontendCallbackUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendCallbackUrl}/auth/google/callback?success=true`;
    res.redirect(redirectUrl);
  } catch (err) {
    // Redirect to frontend callback with error
    const frontendCallbackUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendCallbackUrl}/auth/google/callback?error=${encodeURIComponent(err.message)}`;
    res.redirect(redirectUrl);
  }
  
}

// User Registration
const register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, acceptTerms } =
      req.body;

    if (!acceptTerms)
      return res
        .status(400)
        .json({ success: false, message: "Terms must be accepted" });

    if (password !== confirmPassword)
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });

    if (!isValidFullName(fullName)) {
      return res.status(400).json({
        success: false,
        message: "Full name is required and must be at least 2 characters",
      });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (!isValidPassword(password))
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: "citizen",
    });
    await newUser.save();

    const accessToken = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    );
    const refreshToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    });

    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
      maxAge: accessTokenMaxAge,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
      maxAge: refreshTokenMaxAge,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
        },
        message: "Registration successful",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//User Login
// User Login
const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    );

    let refreshToken;
    if (rememberMe) {
      refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
      });

      user.refreshToken = refreshToken;
      await user.save();

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "none",
        maxAge: refreshTokenMaxAge,
      });
    }

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
      maxAge: accessTokenMaxAge,
    });

    const time = new Date();
    // Options to make it look cleaner (e.g., "Dec 30, 5:45 PM")
    const readableTime = time.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    await makeNotification(
        user._id, 
        "New Login", 
        `New login detected on ${readableTime}. If this wasn't you, please change your password.`
    );

    // ✅ Add accessToken in response body for tests
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profileCompletePct: 0,
        },
        accessToken, // <-- added
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// User Logout
const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//Refresh Access Token (rotates refresh token)
const refreshToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;

    if (!oldRefreshToken)
      return res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });

    jwt.verify(
      oldRefreshToken,
      process.env.JWT_SECRET,
      async (err, decoded) => {
        if (err)
          return res
            .status(403)
            .json({ success: false, message: "Invalid refresh token" });

        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== oldRefreshToken)
          return res
            .status(404)
            .json({ success: false, message: "User not found" });

        //Generate new access token
        const newAccessToken = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
        );

        const newRefreshToken = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
        );

        // Save new refresh token in DB (rotation)
        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "none",
          maxAge: accessTokenMaxAge,
        });

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "none",
          maxAge: refreshTokenMaxAge,
        });

        res.status(200).json({
          success: true,
          message: "Access token refreshed",
          data: {
            user: {
              id: user._id,
              email: user.email,
              role: user.role,
            },
          },
        });
      }
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export { register, login, logout, refreshToken, oauthHandler };
