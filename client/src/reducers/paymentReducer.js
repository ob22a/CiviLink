/**
 * Payment Reducer
 * 
 * Manages payment state based on backend API responses:
 * - Payment history
 * - Current payment status
 * - Payment processing
 * - Verification status
 * 
 * State reflects backend payment data
 */

export const paymentActions = {
    // Fetch payment history
    FETCH_PAYMENT_HISTORY_START: 'FETCH_PAYMENT_HISTORY_START',
    FETCH_PAYMENT_HISTORY_SUCCESS: 'FETCH_PAYMENT_HISTORY_SUCCESS',
    FETCH_PAYMENT_HISTORY_FAILURE: 'FETCH_PAYMENT_HISTORY_FAILURE',

    // Fetch payment status
    FETCH_PAYMENT_STATUS_START: 'FETCH_PAYMENT_STATUS_START',
    FETCH_PAYMENT_STATUS_SUCCESS: 'FETCH_PAYMENT_STATUS_SUCCESS',
    FETCH_PAYMENT_STATUS_FAILURE: 'FETCH_PAYMENT_STATUS_FAILURE',

    // Process payment
    PROCESS_PAYMENT_START: 'PROCESS_PAYMENT_START',
    PROCESS_PAYMENT_SUCCESS: 'PROCESS_PAYMENT_SUCCESS',
    PROCESS_PAYMENT_FAILURE: 'PROCESS_PAYMENT_FAILURE',

    // Verify payment
    VERIFY_PAYMENT_START: 'VERIFY_PAYMENT_START',
    VERIFY_PAYMENT_SUCCESS: 'VERIFY_PAYMENT_SUCCESS',
    VERIFY_PAYMENT_FAILURE: 'VERIFY_PAYMENT_FAILURE',

    // Clear error
    CLEAR_ERROR: 'CLEAR_ERROR',

    // Clear current payment
    CLEAR_CURRENT_PAYMENT: 'CLEAR_CURRENT_PAYMENT',
};

const initialState = {
    // Payment history from backend
    payments: [],

    // Current payment being processed/viewed
    currentPayment: null,

    // Loading states
    isLoading: false,
    isProcessing: false,
    isVerifying: false,

    // Error state
    error: null,

    // Pagination
    pagination: {
        page: 1,
        totalPages: 1,
        total: 0,
    },
};

/**
 * Payment Reducer
 * @param {Object} state - Current state
 * @param {Object} action - Action with type and payload
 * @returns {Object} New state
 */
export const paymentReducer = (state = initialState, action) => {
    switch (action.type) {
        case paymentActions.FETCH_PAYMENT_HISTORY_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case paymentActions.FETCH_PAYMENT_HISTORY_SUCCESS:
            return {
                ...state,
                payments: action.payload.payments ||
                    (Array.isArray(action.payload.data) ? action.payload.data : action.payload.data?.payments) ||
                    [],
                pagination: action.payload.pagination || state.pagination,
                isLoading: false,
                error: null,
            };

        case paymentActions.FETCH_PAYMENT_HISTORY_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };

        case paymentActions.FETCH_PAYMENT_STATUS_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case paymentActions.FETCH_PAYMENT_STATUS_SUCCESS:
            return {
                ...state,
                currentPayment: action.payload.payment || action.payload.data || action.payload,
                isLoading: false,
                error: null,
            };

        case paymentActions.FETCH_PAYMENT_STATUS_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };

        case paymentActions.PROCESS_PAYMENT_START:
            return {
                ...state,
                isProcessing: true,
                error: null,
            };

        case paymentActions.PROCESS_PAYMENT_SUCCESS:
            return {
                ...state,
                currentPayment: action.payload.payment || action.payload.data || action.payload,
                isProcessing: false,
                error: null,
            };

        case paymentActions.PROCESS_PAYMENT_FAILURE:
            return {
                ...state,
                isProcessing: false,
                error: action.payload,
            };

        case paymentActions.VERIFY_PAYMENT_START:
            return {
                ...state,
                isVerifying: true,
                error: null,
            };

        case paymentActions.VERIFY_PAYMENT_SUCCESS: {
            const verifiedPayment = action.payload.payment || action.payload.data || action.payload;

            return {
                ...state,
                currentPayment: verifiedPayment,
                // Update payment in history if it exists
                payments: state.payments.map(p =>
                    p.id === verifiedPayment.id ? verifiedPayment : p
                ),
                isVerifying: false,
                error: null,
            };
        }

        case paymentActions.VERIFY_PAYMENT_FAILURE:
            return {
                ...state,
                isVerifying: false,
                error: action.payload,
            };

        case paymentActions.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        case paymentActions.CLEAR_CURRENT_PAYMENT:
            return {
                ...state,
                currentPayment: null,
            };

        default:
            return state;
    }
};
