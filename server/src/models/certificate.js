import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    // Owner of the certificate (citizen)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // The application that produced this certificate
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true, // one certificate per application
    },

    category: {
      type: String,
      enum: ["TIN", "VITAL"],
      required: true,
      index: true,
    },

    // Only relevant for VITAL
    type: {
      type: String,
      enum: ["birth", "marriage", null],
      required: function () {
        return this.category === "VITAL";
      },
    },

    appointment: {
      type: mongoose.Schema.Types.Mixed,
      required: function () {
        return this.category === "VITAL";
      },
    },

    // Where the generated PDF is stored
    fileUrl: {
      type: String,
      required: true,
    },

    // Officer who approved & issued it
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      required: true,
    }
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;