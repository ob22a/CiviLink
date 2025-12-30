import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";

const checkConversationAccess = async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user.id; 
  const userRole = req.user.role;

  if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({
      success: false,
      error: 'Valid conversationId is required'
    });
  }

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    let hasAccess = false;
    
    switch (userRole) {
      case 'admin':
        hasAccess = false; // Admins have no access to conversations
        break;
      case 'citizen':
        hasAccess = conversation.citizenId.toString() === userId;
        break;
      case 'officer':
        hasAccess = conversation.officerId?.toString() === userId;
        break;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this conversation'
      });
    }

    req.conversation = conversation;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error while checking conversation access'
    });
  }
};

export default checkConversationAccess;