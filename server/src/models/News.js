import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

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
    // This stores the PATH (e.g., "uploads/17356.png")
    headerImageUrl: {
        type: String, 
        default: null
    },
}, { 
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

// Indexing createdAt for fast "Recent News" queries
newsSchema.index({ createdAt: -1 }); 

// Create a virtual property 'imageUrl' for the Frontend to use
newsSchema.virtual('fullImageUrl').get(function() {
  if (!this.headerImageUrl) return null;

  const bucketName = 'News';
  
  // Clean the URL: ensure it doesn't have a trailing slash
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, ""); 
  
  // Format: https://project-id.supabase.co/storage/v1/object/public/News/path/to/file.png
  return `${baseUrl}/storage/v1/object/public/${bucketName}/${this.headerImageUrl}`;
});

const News = mongoose.model("News", newsSchema);

export default News;