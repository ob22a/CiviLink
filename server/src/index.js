import express from "express";
import "dotenv/config";
import "../config/passport_setup.js";
import connectDB from "../config/db.js";
import cookieParser from "cookie-parser";

//Routes
import authRoutes from "./routes/auth.js";
import tinRoutes from "./routes/tin.js";
import vitalRoutes from "./routes/vital.js";
import officerRoutes from "./routes/officer.js";
import idUploadRoutes from "./routes/idUpload.route.js"
import chatRoutes from "./routes/chat.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// connect to database only when NOT running tests
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

//Routes middleware
app.use("/api/v1/tin", tinRoutes);
app.use("/api/v1/vital", vitalRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/officer", officerRoutes);
app.use("/api/v1/user/id", idUploadRoutes);
app.use("/api/v1/chats", chatRoutes);

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
