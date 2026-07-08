import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePayment } from '../../hooks/usePayment';
import { PaymentProvider } from '../../context/PaymentContext';
import * as api from '../../api/payment.api';

vi.mock('../../api/payment.api', () => ({
    getPaymentHistory: vi.fn(),
    getPaymentStatus: vi.fn(),
    processPayment: vi.fn(),
    verifyPayment: vi.fn(),
    downloadReceipt: vi.fn(),
}));

describe('usePayment Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const wrapper = ({ children }) => React.createElement(PaymentProvider, null, children);

    it('should initialize with initial state', () => {
        const { result } = renderHook(() => usePayment(), { wrapper });
        expect(result.current.isLoading).toBe(false);
        expect(result.current.payments).toEqual([]);
        expect(result.current.isCurrentPaymentSuccessful).toBe(false);
    });

    it('should fetch payment history successfully', async () => {
        const mockHistory = {
            success: true,
            data: [{ _id: 'p1', amount: 50, status: 'success' }],
            pagination: { total: 1, totalPages: 1, page: 1 }
        };
        vi.mocked(api.getPaymentHistory).mockResolvedValue(mockHistory);

        const { result } = renderHook(() => usePayment(), { wrapper });

        await act(async () => {
            await result.current.fetchPaymentHistory(1, 10);
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.payments).toHaveLength(1);
            expect(result.current.successfulPayments).toHaveLength(1);
        });
    });

    it('should process payment and set current payment', async () => {
        const mockInit = {
            success: true,
            payment: { paymentId: 'p1', checkoutUrl: 'http://test.com', txRef: 'ref1', status: 'pending' }
        };
        vi.mocked(api.processPayment).mockResolvedValue(mockInit);

        const { result } = renderHook(() => usePayment(), { wrapper });

        await act(async () => {
            await result.current.processPayment({ amount: 50, serviceType: 'tin' });
        });

        await waitFor(() => {
            expect(result.current.currentPayment).not.toBeNull();
            expect(result.current.currentPayment.paymentId).toBe('p1');
        });
    });
});
