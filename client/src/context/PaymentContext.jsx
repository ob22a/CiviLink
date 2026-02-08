/**
 * Payment Context
 * 
 * Manages payment state using paymentReducer.
 * Handles processing, verification, and history.
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { paymentReducer, paymentActions } from '../reducers/paymentReducer.js';
import * as paymentAPI from '../api/payment.api.js';

const PaymentContext = createContext(null);

export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (!context) {
        throw new Error('usePayment must be used within a PaymentProvider');
    }
    return context;
};

export const PaymentProvider = ({ children }) => {
    const [state, dispatch] = useReducer(paymentReducer, {
        payments: [],
        currentPayment: null,
        isLoading: false,
        isProcessing: false,
        isVerifying: false,
        error: null,
        pagination: { page: 1, total: 0, totalPages: 1 }
    });

    // Fetch Payment History
    const fetchPaymentHistory = useCallback(async (page = 1, limit = 10) => {
        dispatch({ type: paymentActions.FETCH_PAYMENT_HISTORY_START });
        try {
            const result = await paymentAPI.getPaymentHistory(page, limit);
            dispatch({ type: paymentActions.FETCH_PAYMENT_HISTORY_SUCCESS, payload: result });
            return { success: true, data: result };
        } catch (error) {
            dispatch({ type: paymentActions.FETCH_PAYMENT_HISTORY_FAILURE, payload: error.message });
            return { success: false, error: error.message };
        }
    }, []);

    // Process Payment (Start Transaction)
    const processPayment = useCallback(async (paymentData) => {
        dispatch({ type: paymentActions.PROCESS_PAYMENT_START });
        try {
            console.log('PaymentContext: Processing payment with data:', paymentData);
            const result = await paymentAPI.processPayment(paymentData);
            console.log('PaymentContext: processPayment API result:', result);
            dispatch({ type: paymentActions.PROCESS_PAYMENT_SUCCESS, payload: result });

            // Return validation URL if available
            const data = result.data || result;
            return {
                success: true,
                data: data,
                checkoutUrl: data.checkoutUrl || data.checkout_url
            };
        } catch (error) {
            dispatch({ type: paymentActions.PROCESS_PAYMENT_FAILURE, payload: error.message });
            return { success: false, error: error.message };
        }
    }, []);

    // Verify Payment (After Redirect)
    const verifyPayment = useCallback(async (txRef) => {
        dispatch({ type: paymentActions.VERIFY_PAYMENT_START });
        try {
            console.log('PaymentContext: Verifying payment txRef:', txRef);
            const result = await paymentAPI.verifyPayment(txRef);
            console.log('PaymentContext: verifyPayment API result:', result);
            dispatch({ type: paymentActions.VERIFY_PAYMENT_SUCCESS, payload: result });
            return { success: true, data: result };
        } catch (error) {
            dispatch({ type: paymentActions.VERIFY_PAYMENT_FAILURE, payload: error.message });
            return { success: false, error: error.message };
        }
    }, []);

    // Clear Errors
    const clearError = useCallback(() => {
        dispatch({ type: paymentActions.CLEAR_ERROR });
    }, []);

    const value = {
        // State
        payments: state.payments,
        currentPayment: state.currentPayment,
        pagination: state.pagination,
        isLoading: state.isLoading,
        isProcessing: state.isProcessing,
        isVerifying: state.isVerifying,
        error: state.error,

        // Actions
        fetchPaymentHistory,
        processPayment,
        verifyPayment,
        clearError
    };

    return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
};
