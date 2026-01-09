import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const notificationSchema = new mongoose.Schema({
    recipient:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true,
        index: true
    },
    title:{
        type: String,
        enum: ["Application Status", "Officer Assignment", "Payment Status", "News Assignment","New Login","Officer Response","Other"],
        required: true
    },
    message:{
        type: String,
        required: true
    },
    read:{
        type: Boolean,
        default: false,
        index:true
    },
    deletedAt:{ // soft delete instead of real deletion 
        type: Date,
        default: null
    }
},
  { timestamps: true}
);

notificationSchema.pre(/^find/, function(next) {
    this.where({ deletedAt: null });
});

notificationSchema.plugin(aggregatePaginate);

notificationSchema.index({recipient: 1, read: 1, deletedAt: 1});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;