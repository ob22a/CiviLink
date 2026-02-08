import { useContext } from 'react';
import { PaymentContext } from '../context/PaymentContext.jsx';

/**
 * usePayment Hook
 * 
 * Consumes the PaymentContext.
 * Provides central access to payment history, processing, and status.
 */
export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (!context) {
        throw new Error('usePayment must be used within a PaymentProvider');
    }
    return context;
};
