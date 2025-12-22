import mongoose from "mongoose";
import Application from "./Application.js";
import User from "./User.js";

const paymentSchema = new mongoose.Schema({
  txRef: {
    // Chapa transaction reference
    type: String,
    unique: true,
    required: true,
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    enum: ["vital_birth", "tin", "vital_marriage", "platform_fee"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "ETB",
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed", "refunded"],
    default: "pending",
  },
  receiptUrl: {
    // optional; can generate when user downloads
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
