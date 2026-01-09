import mongoose from "mongoose";

const appointmentCounterSchema = new mongoose.Schema(
  {
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    slot: {
      type: String,
      enum: ["Morning", "Afternoon"],
      required: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
      max: 20,
    },
  },
  { timestamps: true }
);

// Prevent duplicate counters per officer/day/slot
appointmentCounterSchema.index(
  { officerId: 1, date: 1, slot: 1 },
  { unique: true }
);

export default mongoose.model(
  "AppointmentCounter",
  appointmentCounterSchema
);
