import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

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

      req.user = user;
      next();
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default verifyToken;
