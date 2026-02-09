import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { chatReducer, chatActions } from '../reducers/chatReducer.js';
import * as chatAPI from '../api/chat.api.js';

export const ChatContext = createContext(null);

// Hook removed and moved to src/hooks/useChat.js

export const ChatProvider = ({ children }) => {
    const [state, dispatch] = useReducer(chatReducer, {
        conversations: [],
        selectedConversation: null,
        unreadCount: 0,
        isLoading: false,
        isSending: false,
        error: null,
        pagination: {
            page: 1,
            totalPages: 1,
            total: 0,
            hasNextPage: false,
            hasPrevPage: false,
        },
    });

    /**
     * Fetch conversations for officer
     */
    const fetchConversations = useCallback(async (page, limit) => {
        dispatch({ type: chatActions.FETCH_CONVERSATIONS_START });
        try {
            const response = await chatAPI.getConversations(page, limit);
            if (response.success) {
                dispatch({ type: chatActions.FETCH_CONVERSATIONS_SUCCESS, payload: response });
            } else {
                dispatch({ type: chatActions.FETCH_CONVERSATIONS_FAILURE, payload: response.message });
            }
        } catch (error) {
            dispatch({ type: chatActions.FETCH_CONVERSATIONS_FAILURE, payload: error.message });
        }
    }, []);

    /**
     * Fetch conversations for citizen
     */
    const fetchCitizenConversations = useCallback(async (page, limit) => {
        dispatch({ type: chatActions.FETCH_CONVERSATIONS_START });
        try {
            const response = await chatAPI.getCitizenConversations(page, limit);
            if (response.success) {
                dispatch({ type: chatActions.FETCH_CONVERSATIONS_SUCCESS, payload: response });
            } else {
                dispatch({ type: chatActions.FETCH_CONVERSATIONS_FAILURE, payload: response.message });
            }
        } catch (error) {
            dispatch({ type: chatActions.FETCH_CONVERSATIONS_FAILURE, payload: error.message });
        }
    }, []);

    /**
     * Fetch conversation details
     */
    const fetchConversationDetails = useCallback(async (id) => {
        dispatch({ type: chatActions.FETCH_CONVERSATION_DETAILS_START });
        try {
            const response = await chatAPI.getConversationById(id);
            if (response.success) {
                dispatch({ type: chatActions.FETCH_CONVERSATION_DETAILS_SUCCESS, payload: response });
            } else {
                dispatch({ type: chatActions.FETCH_CONVERSATION_DETAILS_FAILURE, payload: response.message });
            }
        } catch (error) {
            dispatch({ type: chatActions.FETCH_CONVERSATION_DETAILS_FAILURE, payload: error.message });
        }
    }, []);

    /**
     * Send message/Response (Officer)
     */
    const sendMessage = useCallback(async (id, content) => {
        dispatch({ type: chatActions.SEND_MESSAGE_START });
        try {
            const response = await chatAPI.postMessage(id, content);
            if (response.success) {
                dispatch({ type: chatActions.SEND_MESSAGE_SUCCESS, payload: response });
                return response;
            } else {
                dispatch({ type: chatActions.SEND_MESSAGE_FAILURE, payload: response.message });
                throw new Error(response.message);
            }
        } catch (error) {
            dispatch({ type: chatActions.SEND_MESSAGE_FAILURE, payload: error.message });
            throw error;
        }
    }, []);

    /**
     * Submit Support Inquiry (Citizen/Guest)
     */
    const submitSupportInquiry = useCallback(async (payload) => {
        dispatch({ type: chatActions.SEND_MESSAGE_START });
        try {
            const response = await chatAPI.submitInquiry(payload);
            if (response.success) {
                dispatch({ type: chatActions.SEND_MESSAGE_SUCCESS, payload: response });
                return response;
            } else {
                dispatch({ type: chatActions.SEND_MESSAGE_FAILURE, payload: response.message });
                throw new Error(response.message);
            }
        } catch (error) {
            dispatch({ type: chatActions.SEND_MESSAGE_FAILURE, payload: error.message });
            throw error;
        }
    }, []);

    /**
     * Mark as read
     */
    const markAsRead = useCallback(async (id) => {
        dispatch({ type: chatActions.MARK_READ_START, payload: id });
        try {
            const response = await chatAPI.markConversationAsRead(id);
            if (response.success) {
                dispatch({ type: chatActions.MARK_READ_SUCCESS, payload: response });
            } else {
                dispatch({ type: chatActions.MARK_READ_FAILURE, payload: { id, error: response.message } });
            }
        } catch (error) {
            dispatch({ type: chatActions.MARK_READ_FAILURE, payload: { id, error: error.message } });
        }
    }, []);

    const clearError = useCallback(() => dispatch({ type: chatActions.CLEAR_ERROR }), []);
    const clearSelected = useCallback(() => dispatch({ type: chatActions.CLEAR_SELECTED }), []);

    const value = {
        ...state,
        // Derived Logic (Merged from useChatState standalone)
        hasConversations: state.conversations.length > 0,
        unreadConversations: state.conversations.filter(c => !c.read),

        // Actions
        fetchConversations,
        fetchCitizenConversations,
        fetchConversationDetails,
        sendMessage,
        submitSupportInquiry,
        markAsRead,
        clearError,
        clearSelected,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
