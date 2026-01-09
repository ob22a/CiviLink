/**
 * useChatState Hook
 * 
 * Custom hook for managing chat/conversation state using useReducer.
 * Provides:
 * - Conversation list (officer/citizen)
 * - Message handling
 * - Pagination support
 * - API integration with useCallback
 */

import { useReducer, useCallback, useMemo } from 'react';
import { chatReducer, chatActions } from '../reducers/chatReducer.js';
import {
    getConversations,
    getCitizenConversations,
    getConversationById,
    postMessage,
    markConversationAsRead as markAsReadAPI,
    submitInquiry
} from '../api/chat.api.js';

export const useChatState = () => {
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
            const response = await getConversations(page, limit);
            dispatch({
                type: chatActions.FETCH_CONVERSATIONS_SUCCESS,
                payload: response
            });
        } catch (error) {
            dispatch({
                type: chatActions.FETCH_CONVERSATIONS_FAILURE,
                payload: error.message || 'Failed to fetch conversations'
            });
        }
    }, []);

    /**
     * Fetch conversations for citizen
     */
    const fetchCitizenConversations = useCallback(async (page, limit) => {
        dispatch({ type: chatActions.FETCH_CONVERSATIONS_START });
        try {
            const response = await getCitizenConversations(page, limit);
            dispatch({
                type: chatActions.FETCH_CONVERSATIONS_SUCCESS,
                payload: response
            });
        } catch (error) {
            dispatch({
                type: chatActions.FETCH_CONVERSATIONS_FAILURE,
                payload: error.message || 'Failed to fetch conversations'
            });
        }
    }, []);

    /**
     * Fetch conversation details
     */
    const fetchConversationDetails = useCallback(async (id) => {
        dispatch({ type: chatActions.FETCH_CONVERSATION_DETAILS_START });
        try {
            const response = await getConversationById(id);
            dispatch({
                type: chatActions.FETCH_CONVERSATION_DETAILS_SUCCESS,
                payload: response
            });
        } catch (error) {
            dispatch({
                type: chatActions.FETCH_CONVERSATION_DETAILS_FAILURE,
                payload: error.message || 'Failed to fetch conversation'
            });
        }
    }, []);

    /**
     * Send message (Officer)
     */
    const sendMessage = useCallback(async (id, content) => {
        dispatch({ type: chatActions.SEND_MESSAGE_START });
        try {
            const response = await postMessage(id, content);
            dispatch({ type: chatActions.SEND_MESSAGE_SUCCESS, payload: response });
            return response;
        } catch (error) {
            dispatch({
                type: chatActions.SEND_MESSAGE_FAILURE,
                payload: error.message || 'Failed to send message'
            });
            throw error;
        }
    }, []);

    /**
     * Mark as read
     */
    const markAsRead = useCallback(async (id) => {
        dispatch({ type: chatActions.MARK_READ_START, payload: id });
        try {
            const response = await markAsReadAPI(id);
            dispatch({ type: chatActions.MARK_READ_SUCCESS, payload: response });
        } catch (error) {
            dispatch({
                type: chatActions.MARK_READ_FAILURE,
                payload: { id, error: error.message }
            });
        }
    }, []);

    /**
     * Submit new inquiry (Citizen/Guest)
     */
    const submitSupportInquiry = useCallback(async (payload) => {
        dispatch({ type: chatActions.SEND_MESSAGE_START });
        try {
            const response = await submitInquiry(payload);
            dispatch({ type: chatActions.SEND_MESSAGE_SUCCESS, payload: response });
            return response;
        } catch (error) {
            dispatch({
                type: chatActions.SEND_MESSAGE_FAILURE,
                payload: error.message || 'Failed to submit inquiry'
            });
            throw error;
        }
    }, []);

    const clearError = useCallback(() => dispatch({ type: chatActions.CLEAR_ERROR }), []);
    const clearSelected = useCallback(() => dispatch({ type: chatActions.CLEAR_SELECTED }), []);

    // Derived values
    const hasConversations = useMemo(() => state.conversations.length > 0, [state.conversations]);
    const unreadConversations = useMemo(() => state.conversations.filter(c => !c.read), [state.conversations]);

    return {
        ...state,
        hasConversations,
        unreadConversations,
        fetchConversations,
        fetchCitizenConversations,
        fetchConversationDetails,
        sendMessage,
        markAsRead,
        submitSupportInquiry,
        clearError,
        clearSelected,
    };
};
