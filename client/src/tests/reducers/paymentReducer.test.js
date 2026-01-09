import { describe, it, expect } from 'vitest';
import { paymentReducer, paymentActions } from '../../reducers/paymentReducer';

describe('paymentReducer', () => {
    const initialState = {
        payments: [],
        currentPayment: null,
        isLoading: false,
        isProcessing: false,
        isVerifying: false,
        error: null,
        pagination: {
            page: 1,
            totalPages: 1,
            total: 0,
        },
    };

    it('should handle FETCH_PAYMENT_HISTORY_SUCCESS', () => {
        const mockPayload = {
            payments: [{ _id: 'p1', amount: 100 }],
            pagination: { total: 5, totalPages: 1, page: 1 }
        };
        const action = { type: paymentActions.FETCH_PAYMENT_HISTORY_SUCCESS, payload: mockPayload };
        const state = paymentReducer(initialState, action);
        expect(state.payments).toHaveLength(1);
        expect(state.pagination.total).toBe(5);
    });

    it('should handle FETCH_PAYMENT_HISTORY_SUCCESS with data as an array', () => {
        const mockPayload = {
            data: [{ _id: 'p1', amount: 50 }],
            pagination: { total: 1, totalPages: 1, page: 1 }
        };
        const action = { type: paymentActions.FETCH_PAYMENT_HISTORY_SUCCESS, payload: mockPayload };
        const state = paymentReducer(initialState, action);
        expect(state.payments).toHaveLength(1);
    });

    it('should handle VERIFY_PAYMENT_SUCCESS and update history', () => {
        const startState = {
            ...initialState,
            payments: [{ id: 'p1', status: 'pending' }]
        };
        const verifiedPayment = { id: 'p1', status: 'success' };
        const action = { type: paymentActions.VERIFY_PAYMENT_SUCCESS, payload: verifiedPayment };
        const state = paymentReducer(startState, action);
        expect(state.currentPayment).toEqual(verifiedPayment);
        expect(state.payments[0].status).toBe('success');
    });
});
