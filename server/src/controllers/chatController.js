import Conversation from "../models/Conversation.js";
import { citizenMessageSchema, officerMessageSchema } from "../validators/conversationValidator.js";
import { makeNotification } from "../utils/makeNotification.js";
import mongoose from "mongoose";

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
        const { message, subject, subcity, guestName, guestEmail } = value;

        // Logged-in citizen or guest
        const citizenId = req.user ? req.user.id : null;
        const assignedOfficer = req.assignedOfficer || null;

        const conversationData = {
            subject,
            citizenMessage: message,
            subcity: subcity || 'Global', // Default if not provided
            officerId: assignedOfficer,
        };

        if (citizenId) {
            conversationData.citizenId = citizenId;
        } else {
            conversationData.guestName = guestName;
            conversationData.guestEmail = guestEmail;
        }
        console.debug("About to create new conversation here is the object.", conversationData);
        const newConversation = new Conversation(conversationData);
        await newConversation.save();

        res.status(201).json({
            success: true,
            data: {
                conversationId: newConversation._id,
                message: "Support inquiry submitted successfully"
            }
        });

    } catch (error) {
        console.error("Create conversation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit support request"
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
        const conversation = req.conversation;
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
        console.error(error);
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
        await conversation.save();

        if(conversation.citizenId) makeNotification(conversation.citizenId, "Officer Response", "Officers have responded to your message! Check your messages")

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

export const getCitizenConversations = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const citizenId = req.user.id;
        console.log(citizenId);

        const conversations = await Conversation.find({ citizenId: new mongoose.Types.ObjectId(citizenId) })
            .populate('officerId', 'fullName')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error
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