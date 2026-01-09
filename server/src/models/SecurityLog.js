import mongoose from "mongoose";

const securityLogSchema = new mongoose.Schema({
  timeOfAttempt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  attemptType: {
    type: String,
    enum: [
      "LOGIN_SUCCESS",
      "LOGIN_FAILURE",
      "UNAUTHORIZED_ACCESS",
      "TOKEN_EXPIRED",
      "LOGIN_FAILED",
    ],
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  officerName: {
    type: String,
  },
  success: {
    type: Boolean,
    default: false,
  },
});

const SecurityLog = mongoose.model("SecurityLog", securityLogSchema);
export default SecurityLog;
