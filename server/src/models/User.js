import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["citizen", "admin", "officer"],
    default: "citizen",
  },
  refreshToken: String,
});

const User = mongoose.model("User", userSchema);

export default User;
