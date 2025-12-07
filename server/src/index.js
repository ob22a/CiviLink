import express from "express";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

//connect to database
connectDB();

app.use("/api/v1/auth", authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

//for tests
export default app;

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
