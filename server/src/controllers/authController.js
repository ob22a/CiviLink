import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ms from "ms";
import {
  isValidPassword,
  isValidFullName,
  isValidEmail,
} from "../utils/validators.js";

const accessTokenMaxAge = ms(process.env.ACCESS_TOKEN_EXPIRES);
const refreshTokenMaxAge = ms(process.env.REFRESH_TOKEN_EXPIRES);

const isProduction = process.env.NODE_ENV === "production";

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

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Strict",
      maxAge: accessTokenMaxAge,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Strict",
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
    if (rememberMe) {
      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
      });

      user.refreshToken = refreshToken;
      await user.save();

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "Strict",
        maxAge: refreshTokenMaxAge,
      });
    }

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Strict",
      maxAge: accessTokenMaxAge,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profileCompletePct: 0,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

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
      sameSite: "Strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Strict",
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
          sameSite: "Strict",
          maxAge: accessTokenMaxAge,
        });

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "Strict",
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

export { register, login, logout, refreshToken };
