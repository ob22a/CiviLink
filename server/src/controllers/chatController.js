import Conversation from "../models/Conversation.js";
import { citizenMessageSchema, officerMessageSchema } from "../validators/conversationValidator.js";

export const createConversation = async (req, res) => {
    try {
        // Validate using Joi schema
        const { error, value } = citizenMessageSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        const { message, subject, subcity } = value;
        const assignedOfficer = req.assignedOfficer;
        const newConversation = new Conversation({ citizenId: req.user.id, subject, citizenMessage: message, subcity, officerId: assignedOfficer });
        await newConversation.save();
        res.status(201).json({
            success: true,
            data: {
                conversationId: newConversation._id,
                message: "Conversation created successfully"
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getConversations = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // destructure page and limit from query parameters with default values
        const officerId = req.user.id;

        const conversations = await Conversation.find({ officerId })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Count total unread conversations. THIS IS NOT EFFICIENT FOR LARGE DATASETS AND SHOULD BE OPTIMIZED LATER
        const totalConversations = await Conversation.countDocuments({ officerId, read: false });

        res.status(200).json({
            success: true,
            data: conversations,
            unreadCount: totalConversations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getConversationById = async (req, res) => {
    try {
        const conversationId = req.conversation._id;
        const officerId = req.user.id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        res.status(200).json({
            success: true,
            data: conversation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const postMessageToConversation = async (req, res) => {
    try {
        const { error, value } = officerMessageSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        const conversationId = req.params.conversationId;
        const { messageContent } = value;
        const officerId = req.user.id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        conversation.officerMessage = messageContent;
        conversation.status = 'closed';
        conversation.officerMessageDate = new Date();
        await conversation.save();

        res.status(200).json({
            success: true,
            data: {
                conversationId: conversation._id,
                message: "Message sent successfully"
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const markConversationAsRead = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        conversation.read = true;
        await conversation.save();

        res.status(200).json({
            success: true,
            data: {
                conversationId: conversation._id,
                message: "Conversation marked as read"
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};