import mongoose from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const OfficerStatsMonthlySchema = new mongoose.Schema({
    officerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Officer',
        required: true,
    },
    period: {
        type: String,
        required: true,
    }, // YYYY-MM format
    department: {
        type: String,
        required: true,
    },
    subcity: {
        type: String,
        required: true,
    },
    totalConversations: {
        type: Number,
        default: 0,
    },
    processedConversations: {
        type: Number,
        default: 0,
    },
    totalApplications: {
        type: Number,
        default: 0,
    },
    processedApplications: {
        type: Number,
        default: 0,
    },
    communicationResponseRate: {
        type: Number,
        default: 0,
    },
    applicationResponseRate: {
        type: Number,
        default: 0,
    },
    averageResponseTimeMs: {
        type: Number,
        default: 0,
    },
    rawScore: {
        type: Number,
        default: 0,
    },
    rankScore: {
        type: Number,
        default: 0,
    },
    requestsProcessed: {
        type: Number,
        default: 0,
    },
    requestsTotal: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

OfficerStatsMonthlySchema.index({ officerId: 1, period: 1 }, { unique: true });
OfficerStatsMonthlySchema.index({ period: 1 });
OfficerStatsMonthlySchema.index({ period: 1, rankScore: -1 });
OfficerStatsMonthlySchema.index({ department: 1, subcity: 1 });

OfficerStatsMonthlySchema.plugin(aggregatePaginate);

const OfficerStatsMonthly = mongoose.model('OfficerStatsMonthly', OfficerStatsMonthlySchema);

export default OfficerStatsMonthly;
