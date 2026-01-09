import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const OfficerStatsSchema = new mongoose.Schema({
    officerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Officer',
        required: true,
    },
    period: {
        type: String,
        required: true,
    }, // YYYY-MM format
    totalConversations: {
        type: Number,
        default: 0,
    },
    totalApplications: {
        type: Number,
        default: 0,
    },
    averageResponseTimeMs: {
        type: Number,
        default: 0,
    },
    applicationResponseRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
    },
    communicationResponseRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
    },
    assignedCount: {
        type: Number,
        req: true,
        default: 0,
    },
    score: {
        type: Number,
        default: 0,
    }
},
    { timestamps: true }
);

// Index for performance 
OfficerStatsSchema.index({ officerId: 1, period: 1 });
OfficerStatsSchema.index({ period: 1, score: -1 });

OfficerStatsSchema.plugin(aggregatePaginate);

const OfficerStats = mongoose.model('OfficerStats', OfficerStatsSchema);

export default OfficerStats;