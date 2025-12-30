import mongoose from "mongoose";
import User from "./User.js";

const Officer = User.discriminator(
  "officer",
  new mongoose.Schema({
    department: {
      type: String,
      enum: ['approver', 'customer_support'],
      required: true,
    },
    onLeave: {
      type: Boolean,
      default: false,
    },
    workLoad: {
      type: Number,
      default: 0,
    },
    writeNews: {
      type: Boolean,
      default: false,
    },
    subcity: {
      type: String,
      default: "unknown"
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId
    }
  })
);

export default Officer;