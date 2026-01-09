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
      enum: ["pending_payment", "pending", "approved", "rejected"],
      default: "pending_payment",
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

// Indexes to improve query performance
applicationSchema.index({ applicant: 1, category: 1, status: 1 });

// No two approved TIN applications can share the same TIN
applicationSchema.index(
  { "formData.tin": 1 },
  {
    unique: true,
    partialFilterExpression: {
      category: "TIN",
      status: "approved",
      "formData.tin": { $exists: true }
    }
  }
);

export default Application;
