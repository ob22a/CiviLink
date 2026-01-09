import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllApplications, submitTinApplication } from '../../api/applications.api';
import { apiRequest } from '../../utils/api';

vi.mock('../../utils/api', () => ({
    apiRequest: vi.fn(),
}));

describe('applications.api', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getAllApplications should call apiRequest with correct params', async () => {
        const mockData = { success: true, data: [] };
        vi.mocked(apiRequest).mockResolvedValue(mockData);

        const result = await getAllApplications(2, 20);

        expect(apiRequest).toHaveBeenCalledWith(
            '/applications?page=2&limit=20',
            expect.objectContaining({ method: 'GET' })
        );
        expect(result).toEqual(mockData);
    });

    it('submitTinApplication should call apiRequest with POST', async () => {
        const formData = { taxPayerName: 'John Doe' };
        const mockResponse = { success: true, data: { applicationId: '123' } };
        vi.mocked(apiRequest).mockResolvedValue(mockResponse);

        const result = await submitTinApplication(formData);

        expect(apiRequest).toHaveBeenCalledWith(
            '/tin/applications',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(formData)
            })
        );
        expect(result).toEqual(mockResponse);
    });
});
