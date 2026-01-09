import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChatState } from '../../hooks/useChatState';
import * as api from '../../api/chat.api';

vi.mock('../../api/chat.api', () => ({
    getConversations: vi.fn(),
    getCitizenConversations: vi.fn(),
    getConversationById: vi.fn(),
    postMessage: vi.fn(),
    markConversationAsRead: vi.fn(),
    submitInquiry: vi.fn(),
}));

describe('useChatState Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with initial state', () => {
        const { result } = renderHook(() => useChatState());
        expect(result.current.isLoading).toBe(false);
        expect(result.current.conversations).toEqual([]);
        expect(result.current.unreadCount).toBe(0);
    });

    it('should fetch officer conversations successfully', async () => {
        const mockResponse = {
            success: true,
            data: [{ _id: '1', subject: 'Inquiry' }],
            unreadCount: 1,
            pagination: { total: 1, totalPages: 1, page: 1, hasNextPage: false, hasPrevPage: false }
        };
        vi.mocked(api.getConversations).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useChatState());

        result.current.fetchConversations(1, 10);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.unreadCount).toBe(1);
        });

        expect(result.current.conversations).toHaveLength(1);
        expect(result.current.unreadCount).toBe(1);
        expect(api.getConversations).toHaveBeenCalledWith(1, 10);
    });

    it('should mark conversation as read', async () => {
        const mockResponse = { success: true, data: { message: 'Read' } };
        vi.mocked(api.markConversationAsRead).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useChatState());

        result.current.markAsRead('1');

        await waitFor(() => {
            expect(api.markConversationAsRead).toHaveBeenCalledWith('1');
        });
    });
});
