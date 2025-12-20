import express from 'express';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { createConversation, getConversationById, getConversations, postMessageToConversation, markConversationAsRead } from '../controllers/chatController.js';
import {assignConversationOfficer} from '../middleware/assignOfficer.js';
import checkConversationAccess from '../middleware/conversationAuth.js';

const router = express.Router();

// Start a new conversation
router.post(
    '/',
    verifyToken,
    authorizeRoles('citizen'),
    assignConversationOfficer,
    createConversation
)

// Get Conversations for officer
router.get(
    '/',
    verifyToken,
    authorizeRoles('officer'),
    getConversations
)

// Get Messages in a conversation
router.get(
    '/:conversationId/',
    verifyToken,
    authorizeRoles('officer', 'citizen'),
    checkConversationAccess,
    getConversationById
)

// Post Message to a conversation
router.post(
    '/:conversationId/',
    verifyToken,
    authorizeRoles('officer'),
    checkConversationAccess,
    postMessageToConversation
)

// Mark conversation as read
router.patch(
    '/:conversationId/read',
    verifyToken,
    authorizeRoles('officer'),
    checkConversationAccess,
    markConversationAsRead
)


export default router;