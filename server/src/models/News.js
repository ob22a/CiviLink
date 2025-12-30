import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    headerImageUrl: {
        type: String,
        default: null
    },
}, { timestamps: true });

// Indexing createdAt for fast "Recent News" queries
newsSchema.index({ createdAt: -1 }); 

const News = mongoose.model("News", newsSchema);

export default News;