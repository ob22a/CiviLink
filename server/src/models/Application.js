import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: ["TIN", "VITAL"],
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["birth", "marriage", null],
      required: function () {
        return this.category === "VITAL";
      },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    formData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    requiredIDs: {
      kebele: { type: Boolean, default: false },
      fayda: { type: Boolean, default: false },
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    // We can add assigned officer to track which officer is handling the application and there is no need for a separate Task model
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
