import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Changed to false to support guests
  },
  guestName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  guestEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  citizenMessage: {
    type: String,
    required: true,
    trim: true,
  },

  officerMessage: {
    type: String,
    trim: true,
    default: null,
  },

  read: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ['pending', 'assigned', 'closed'],
    default: 'pending'
  },
},
  { timestamps: true }
);

// Index to improve performance
conversationSchema.index({ updatedAt: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;