/**
 * Chat Reducer
 * 
 * Manages chat/conversation state based on backend API responses:
 * - List of conversations (officer and citizen views)
 * - Single conversation details
 * - Unread message counts
 * - Loading and error states
 * - Pagination metadata
 */

export const chatActions = {
    FETCH_CONVERSATIONS_START: 'FETCH_CONVERSATIONS_START',
    FETCH_CONVERSATIONS_SUCCESS: 'FETCH_CONVERSATIONS_SUCCESS',
    FETCH_CONVERSATIONS_FAILURE: 'FETCH_CONVERSATIONS_FAILURE',

    FETCH_CONVERSATION_DETAILS_START: 'FETCH_CONVERSATION_DETAILS_START',
    FETCH_CONVERSATION_DETAILS_SUCCESS: 'FETCH_CONVERSATION_DETAILS_SUCCESS',
    FETCH_CONVERSATION_DETAILS_FAILURE: 'FETCH_CONVERSATION_DETAILS_FAILURE',

    SEND_MESSAGE_START: 'SEND_MESSAGE_START',
    SEND_MESSAGE_SUCCESS: 'SEND_MESSAGE_SUCCESS',
    SEND_MESSAGE_FAILURE: 'SEND_MESSAGE_FAILURE',

    MARK_READ_START: 'MARK_READ_START',
    MARK_READ_SUCCESS: 'MARK_READ_SUCCESS',
    MARK_READ_FAILURE: 'MARK_READ_FAILURE',

    CLEAR_ERROR: 'CLEAR_ERROR',
    CLEAR_SELECTED: 'CLEAR_SELECTED',
};

const initialState = {
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
};

export const chatReducer = (state = initialState, action) => {
    switch (action.type) {
        case chatActions.FETCH_CONVERSATIONS_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case chatActions.FETCH_CONVERSATIONS_SUCCESS:
            return {
                ...state,
                conversations: action.payload.data || action.payload || [],
                unreadCount: action.payload.unreadCount !== undefined ? action.payload.unreadCount : state.unreadCount,
                pagination: action.payload.pagination || state.pagination,
                isLoading: false,
                error: null,
            };

        case chatActions.FETCH_CONVERSATIONS_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };

        case chatActions.FETCH_CONVERSATION_DETAILS_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case chatActions.FETCH_CONVERSATION_DETAILS_SUCCESS:
            return {
                ...state,
                selectedConversation: action.payload.data || action.payload,
                isLoading: false,
                error: null,
            };

        case chatActions.FETCH_CONVERSATION_DETAILS_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };

        case chatActions.SEND_MESSAGE_START:
            return {
                ...state,
                isSending: true,
                error: null,
            };

        case chatActions.SEND_MESSAGE_SUCCESS:
            return {
                ...state,
                isSending: false,
                // If we're updating a single conversation in a list, we might want to update it here
                // but usually we either refetch or it's handled by some optimistic update
                error: null,
            };

        case chatActions.SEND_MESSAGE_FAILURE:
            return {
                ...state,
                isSending: false,
                error: action.payload,
            };

        case chatActions.MARK_READ_START:
            return {
                ...state,
                // Optimistic update
                conversations: state.conversations.map(conv =>
                    conv._id === action.payload ? { ...conv, read: true } : conv
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            };

        case chatActions.MARK_READ_SUCCESS:
            return {
                ...state,
                // Correct data from server if needed
            };

        case chatActions.MARK_READ_FAILURE:
            return {
                ...state,
                // Revert optimistic update
                error: action.payload.error,
            };

        case chatActions.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        case chatActions.CLEAR_SELECTED:
            return {
                ...state,
                selectedConversation: null,
            };

        default:
            return state;
    }
};
