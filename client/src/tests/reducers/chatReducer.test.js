import { describe, it, expect } from 'vitest';
import { chatReducer, chatActions } from '../../reducers/chatReducer';

describe('chatReducer', () => {
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

    it('should return the initial state', () => {
        expect(chatReducer(undefined, {})).toEqual(initialState);
    });

    it('should handle FETCH_CONVERSATIONS_START', () => {
        const action = { type: chatActions.FETCH_CONVERSATIONS_START };
        const state = chatReducer(initialState, action);
        expect(state.isLoading).toBe(true);
    });

    it('should handle FETCH_CONVERSATIONS_SUCCESS', () => {
        const mockPayload = {
            data: [{ _id: '1', subject: 'Test' }],
            unreadCount: 5,
            pagination: { total: 10, totalPages: 1, page: 1 }
        };
        const action = { type: chatActions.FETCH_CONVERSATIONS_SUCCESS, payload: mockPayload };
        const state = chatReducer({ ...initialState, isLoading: true }, action);
        expect(state.isLoading).toBe(false);
        expect(state.conversations).toHaveLength(1);
        expect(state.unreadCount).toBe(5);
        expect(state.pagination.total).toBe(10);
    });

    it('should handle FETCH_CONVERSATION_DETAILS_SUCCESS', () => {
        const mockConv = { _id: '1', messages: [] };
        const action = { type: chatActions.FETCH_CONVERSATION_DETAILS_SUCCESS, payload: mockConv };
        const state = chatReducer(initialState, action);
        expect(state.selectedConversation).toEqual(mockConv);
    });

    it('should handle MARK_READ_START (optimistic update)', () => {
        const startState = {
            ...initialState,
            conversations: [{ _id: '1', read: false }],
            unreadCount: 1
        };
        const action = { type: chatActions.MARK_READ_START, payload: '1' };
        const state = chatReducer(startState, action);
        expect(state.conversations[0].read).toBe(true);
        expect(state.unreadCount).toBe(0);
    });
});
