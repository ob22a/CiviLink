import mongoose from "mongoose";

const uploadedIDSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["fayda", "kebele"],
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UploadedID", uploadedIDSchema);
