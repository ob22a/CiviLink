import express from "express";
import "dotenv/config";
import "../config/passport_setup.js";
import connectDB from "../config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// connect to database only when NOT running tests
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

app.use("/api/v1/auth", authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// for tests
export default app;

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT);
}
