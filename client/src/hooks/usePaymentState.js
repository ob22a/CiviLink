/**
 * usePaymentState Hook
 * 
 * Custom hook for managing payment state using useReducer.
 * Provides:
 * - Payment history
 * - Current payment status
 * - Payment processing and verification
 * - Derived values (filtered payments)
 * - API integration with useCallback
 * 
 * @example
 * const {
 *   payments,
 *   currentPayment,
 *   successfulPayments,
 *   processPayment,
 *   verifyPayment
 * } = usePaymentState();
 */

import { useReducer, useCallback, useMemo } from 'react';
import { paymentReducer, paymentActions } from '../reducers/paymentReducer.js';
import {
    getPaymentHistory,
    getPaymentStatus,
    processPayment as processPaymentAPI,
    verifyPayment as verifyPaymentAPI,
    downloadReceipt,
} from '../api/payment.api.js';

/**
 * Custom hook for payment state management
 * @returns {Object} Payment state and actions
 */
export const usePaymentState = () => {
    const [state, dispatch] = useReducer(paymentReducer, {
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
    });

    // ===== Actions =====

    /**
     * Fetch payment history
     */
    const fetchPaymentHistory = useCallback(async (page, limit) => {
        dispatch({ type: paymentActions.FETCH_PAYMENT_HISTORY_START });
        try {
            const data = await getPaymentHistory(page, limit);
            dispatch({
                type: paymentActions.FETCH_PAYMENT_HISTORY_SUCCESS,
                payload: data
            });
        } catch (error) {
            dispatch({
                type: paymentActions.FETCH_PAYMENT_HISTORY_FAILURE,
                payload: error.message || 'Failed to fetch payment history'
            });
        }
    }, []);

    /**
     * Fetch payment status by ID
     * @param {string} paymentId - Payment ID
     */
    const fetchPaymentStatus = useCallback(async (paymentId) => {
        dispatch({ type: paymentActions.FETCH_PAYMENT_STATUS_START });
        try {
            const data = await getPaymentStatus(paymentId);
            dispatch({
                type: paymentActions.FETCH_PAYMENT_STATUS_SUCCESS,
                payload: data
            });
        } catch (error) {
            dispatch({
                type: paymentActions.FETCH_PAYMENT_STATUS_FAILURE,
                payload: error.message || 'Failed to fetch payment status'
            });
        }
    }, []);

    /**
     * Process a new payment
     * @param {Object} paymentData - Payment data (applicationId, serviceType, phoneNumber, amount)
     */
    const processPayment = useCallback(async (paymentData) => {
        dispatch({ type: paymentActions.PROCESS_PAYMENT_START });
        try {
            const data = await processPaymentAPI(paymentData);
            dispatch({
                type: paymentActions.PROCESS_PAYMENT_SUCCESS,
                payload: data
            });
            return data;
        } catch (error) {
            dispatch({
                type: paymentActions.PROCESS_PAYMENT_FAILURE,
                payload: error.message || 'Failed to process payment'
            });
            throw error;
        }
    }, []);

    /**
     * Verify payment with Chapa
     * @param {string} txRef - Transaction reference
     */
    const verifyPayment = useCallback(async (txRef) => {
        dispatch({ type: paymentActions.VERIFY_PAYMENT_START });
        try {
            const data = await verifyPaymentAPI(txRef);
            dispatch({
                type: paymentActions.VERIFY_PAYMENT_SUCCESS,
                payload: data
            });
            return data;
        } catch (error) {
            dispatch({
                type: paymentActions.VERIFY_PAYMENT_FAILURE,
                payload: error.message || 'Failed to verify payment'
            });
            throw error;
        }
    }, []);

    /**
     * Download payment receipt
     * @param {string} paymentId - Payment ID
     */
    const downloadPaymentReceipt = useCallback(async (paymentId) => {
        try {
            const response = await downloadReceipt(paymentId);
            return response;
        } catch (error) {
            dispatch({
                type: paymentActions.FETCH_PAYMENT_HISTORY_FAILURE,
                payload: error.message || 'Failed to download receipt'
            });
            throw error;
        }
    }, []);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        dispatch({ type: paymentActions.CLEAR_ERROR });
    }, []);

    /**
     * Clear current payment
     */
    const clearCurrentPayment = useCallback(() => {
        dispatch({ type: paymentActions.CLEAR_CURRENT_PAYMENT });
    }, []);

    // ===== Derived State =====

    /**
     * Check if user has any payments
     */
    const hasPayments = useMemo(
        () => state.payments.length > 0,
        [state.payments]
    );

    /**
     * Get successful payments
     */
    const successfulPayments = useMemo(
        () => state.payments.filter(payment => payment.status === 'success'),
        [state.payments]
    );

    /**
     * Get pending payments
     */
    const pendingPayments = useMemo(
        () => state.payments.filter(payment => payment.status === 'pending'),
        [state.payments]
    );

    /**
     * Get failed payments
     */
    const failedPayments = useMemo(
        () => state.payments.filter(payment => payment.status === 'failed'),
        [state.payments]
    );

    /**
     * Count payments by status
     */
    const paymentCounts = useMemo(
        () => ({
            total: state.payments.length,
            successful: successfulPayments.length,
            pending: pendingPayments.length,
            failed: failedPayments.length,
        }),
        [state.payments, successfulPayments, pendingPayments, failedPayments]
    );

    /**
     * Check if current payment is successful
     */
    const isCurrentPaymentSuccessful = useMemo(
        () => state.currentPayment?.status === 'success',
        [state.currentPayment]
    );

    // ===== Return API =====

    return {
        // State
        payments: state.payments,
        currentPayment: state.currentPayment,
        isLoading: state.isLoading,
        isProcessing: state.isProcessing,
        isVerifying: state.isVerifying,
        error: state.error,
        pagination: state.pagination,

        // Derived values
        hasPayments,
        successfulPayments,
        pendingPayments,
        failedPayments,
        paymentCounts,
        isCurrentPaymentSuccessful,

        // Actions
        fetchPaymentHistory,
        fetchPaymentStatus,
        processPayment,
        verifyPayment,
        downloadPaymentReceipt,
        clearError,
        clearCurrentPayment,
    };
};
