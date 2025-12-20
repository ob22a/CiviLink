import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    // Only for email/password users
    password: {
      type: String
    },

    // Only for Google users
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows many null values
    },

    role: {
      type: String,
      enum: ["citizen", "admin", "officer"],
      default: "citizen",
    },

    refreshToken: String,
  },
  { timestamps: true },
  { discriminatorKey: "role" }
);

const User = mongoose.model("User", userSchema);

export default User;
