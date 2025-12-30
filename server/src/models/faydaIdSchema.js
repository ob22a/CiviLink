import mongoose from "mongoose";

const faydaIdSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User reference is required"],
        unique: true
    },

    fullName: {
        type: String,
        required: [true, "Full name is required"]
    },

    dateOfBirth: {
        type: Date,
        required: [true, "Date of birth is required"]
    },

    sex: {
        type: String,
        enum: ["F", "M"],
        required: [true, "Gender is required"]
    },

    expiryDate: {
        type: Date,
        required: [true, "Expiry date is required"]
    },

    fan: {
        type: String,
        unique: true,
        required: [true, "FAN is required"],
        select: false,
        index: true
    }
},
  { timestamps: true }
);

const FaydaId = mongoose.model("FaydaId", faydaIdSchema);

export default FaydaId;