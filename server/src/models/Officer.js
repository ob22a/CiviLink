import mongoose from "mongoose";
import User from "./User.js";

const Officer = User.discriminator(
  "Officer",
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
    subCity: {
      type: String,
      default: "unknown"
    }
  })
);

export default Officer;