import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPaymentHistory, processPayment } from '../../api/payment.api';
import { apiRequest } from '../../utils/api';

vi.mock('../../utils/api', () => ({
    apiRequest: vi.fn(),
}));

describe('payment.api', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getPaymentHistory should call apiRequest with correct params', async () => {
        const mockData = { success: true, data: [] };
        vi.mocked(apiRequest).mockResolvedValue(mockData);

        const result = await getPaymentHistory(1, 5);

        expect(apiRequest).toHaveBeenCalledWith(
            '/payments/history?page=1&limit=5',
            expect.objectContaining({ method: 'GET' })
        );
        expect(result).toEqual(mockData);
    });

    it('processPayment should call apiRequest with POST', async () => {
        const paymentData = { applicationId: '1', amount: 100 };
        const mockResponse = { success: true, data: { checkoutUrl: '...' } };
        vi.mocked(apiRequest).mockResolvedValue(mockResponse);

        const result = await processPayment(paymentData);

        expect(apiRequest).toHaveBeenCalledWith(
            '/payments/pay',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(paymentData)
            })
        );
        expect(result).toEqual(mockResponse);
    });
});
