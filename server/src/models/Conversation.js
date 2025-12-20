import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  citizenId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  officerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Officer' 
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

  read:{
    type: Boolean,
    default: false
  },

  status: { 
    type: String, 
    enum: ['pending', 'assigned', 'closed'], 
    default: 'pending' 
  },
  citizenMessageDate:{
    type: Date,
    default: Date.now
  },
  officerMessageDate: Date,
}, { 
  timestamps: true,
  
});


const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;