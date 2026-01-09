import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getConversations, postMessage } from '../../api/chat.api';
import { apiRequest } from '../../utils/api';

vi.mock('../../utils/api', () => ({
    apiRequest: vi.fn(),
}));

describe('chat.api', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getConversations should call apiRequest with correct params', async () => {
        const mockData = { success: true, data: [] };
        vi.mocked(apiRequest).mockResolvedValue(mockData);

        const result = await getConversations(1, 10);

        expect(apiRequest).toHaveBeenCalledWith(
            '/chats?page=1&limit=10',
            expect.objectContaining({ method: 'GET' })
        );
        expect(result).toEqual(mockData);
    });

    it('postMessage should call apiRequest with POST', async () => {
        const content = 'Hello world';
        const mockResponse = { success: true };
        vi.mocked(apiRequest).mockResolvedValue(mockResponse);

        const result = await postMessage('conv1', content);

        expect(apiRequest).toHaveBeenCalledWith(
            '/chats/conv1',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ messageContent: content })
            })
        );
        expect(result).toEqual(mockResponse);
    });
});
