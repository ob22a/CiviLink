import express from "express";
import dotenv from "dotenv";
dotenv.config();
import "../config/passport_setup.js";
import connectDB from "../config/db.js";
import cookieParser from "cookie-parser";

// Ensure discriminators are registered early
import "./models/Citizen.js";
import "./models/Admin.js";
import "./models/Officer.js";

//Routes
import authRoutes from "./routes/auth.js";
import tinRoutes from "./routes/tin.js";
import vitalRoutes from "./routes/vital.js";
import officerRoutes from "./routes/officer.js";
import idUploadRoutes from "./routes/idUpload.route.js";
import chatRoutes from "./routes/chat.js";
import paymentRoutes from "./routes/payment.js";
import adminRoutes from "./routes/admin.js"
import applicationRoutes from "./routes/applications.js";
import healthRoutes from './routes/health.route.js';
import notificationRoutes from './routes/notification.route.js'

// Cron Jobs
import { startAnalyticsJob } from "./jobs/refreshOfficerAnalytics.job.js";
import initNewsCron from "./jobs/assignNewsOfficer.js";

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
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/health", healthRoutes)
app.use("/api/v1/notifications", notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// for tests
export default app;

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  initNewsCron();
  startAnalyticsJob(); // start cron job only when NOT running tests
  app.listen(PORT);
}
