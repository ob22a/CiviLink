import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Officer from "../models/Officer.js";

const isProduction = process.env.NODE_ENV === "production";

const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid or expired token" });
      }

      const user = await User.findById(decoded.id).select(
        "-password -refreshToken"
      );
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      req.user = { id: user._id.toString(), role: user.role };
      next();
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource",
      });
    }
    next();
  };
};

const canWriteNews = async (req, res, next) => {
    try {
        const officer = await Officer.findById(req.user.id);
        if (officer && officer.writeNews) {
            return next();
        }

        return res.status(403).json({
            success: false,
            error: { message: "Unauthorized: You do not have news writing permissions." }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: { message: "Auth check failed." } });
    }
};

export { verifyToken, authorizeRoles, canWriteNews };
