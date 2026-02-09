import mongoose from 'mongoose';

const GlobalMaxScoreSchema = new mongoose.Schema({
    period: {
        type: String,
        required: true,
        unique: true, // One entry per month
    },
    maxRankScore: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const GlobalMaxScore = mongoose.model('GlobalMaxScore', GlobalMaxScoreSchema);

export default GlobalMaxScore;
