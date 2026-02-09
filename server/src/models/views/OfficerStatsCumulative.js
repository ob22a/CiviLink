import mongoose from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const OfficerStatsCumulativeSchema = new mongoose.Schema({
    officerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Officer',
        required: true,
    },
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

OfficerStatsCumulativeSchema.index({ officerId: 1 }, { unique: true });
OfficerStatsCumulativeSchema.index({ rankScore: -1 });
OfficerStatsCumulativeSchema.index({ department: 1, subcity: 1 });

OfficerStatsCumulativeSchema.plugin(aggregatePaginate);

const OfficerStatsCumulative = mongoose.model('OfficerStatsCumulative', OfficerStatsCumulativeSchema);

export default OfficerStatsCumulative;
