import mongoose from "mongoose";

const kebeleIdSchema = new mongoose.Schema({
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

    idNumber: {
        type: String,
        unique: true,
        required: [true, "An ID number is required"],
        select: false,
        index: true
    }
})

const KebeleId = mongoose.model("KebeleId", kebeleIdSchema);

export default KebeleId;