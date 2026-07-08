import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChat } from '../../hooks/useChat';
import { ChatProvider } from '../../context/ChatContext';
import * as api from '../../api/chat.api';

vi.mock('../../api/chat.api', () => ({
    getConversations: vi.fn(),
    getCitizenConversations: vi.fn(),
    getConversationById: vi.fn(),
    postMessage: vi.fn(),
    markConversationAsRead: vi.fn(),
    submitInquiry: vi.fn(),
}));

describe('useChat Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const wrapper = ({ children }) => React.createElement(ChatProvider, null, children);

    it('should initialize with initial state', () => {
        const { result } = renderHook(() => useChat(), { wrapper });
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

        const { result } = renderHook(() => useChat(), { wrapper });

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

        const { result } = renderHook(() => useChat(), { wrapper });

        result.current.markAsRead('1');

        await waitFor(() => {
            expect(api.markConversationAsRead).toHaveBeenCalledWith('1');
        });
    });
});
