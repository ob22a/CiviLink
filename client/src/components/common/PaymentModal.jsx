import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext.jsx';
import '../../styles/components/PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, application }) => {
    const { processPayment, isProcessing: contextIsProcessing } = usePayment();
    const [phone, setPhone] = useState('');
    const [error, setError] = useState(null);

    if (!isOpen || !application) return null;

    const handlePay = async () => {
        if (!phone) {
            setError('Please enter your phone number');
            return;
        }

        setError(null);

        const params = new URLSearchParams({
            appId: application._id,
            category: application.category,
            type: application.type
        });
        const returnUrl = application.returnUrl || `${window.location.origin}/user/payment-result?${params.toString()}`;
        console.log('PaymentModal: Constructed returnUrl:', returnUrl);
        const callbackUrl = `${window.location.origin}/api/v1/payments/webhook`;

        const result = await processPayment({
            applicationId: application._id,
            serviceType: application.serviceType || 'general',
            amount: application.fee || 100,
            phoneNumber: phone,
            returnUrl,
            callbackUrl
        });

        if (result.success && result.checkoutUrl) {
            // Explicitly append tx_ref to the returnUrl so we have a backup if Chapa fails to append it
            let finalCheckoutUrl = result.checkoutUrl;
            if (result.data?.txRef) {
                const redirectUrl = new URL(returnUrl);
                redirectUrl.searchParams.set('tx_ref', result.data.txRef);

                // Some gateways might need this in the checkout URL itself or we just trust the returnUrl we sent
                // But Chapa uses the return_url we provided during initialization.
            }

            // Redirect to Chapa
            window.location.href = result.checkoutUrl;
        } else {
            setError(result.error || 'Payment initialization failed');
        }
    };

    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal-content">
                <button className="close-modal-btn" onClick={onClose}>&times;</button>

                <div className="payment-modal-header">
                    <div className="payment-icon">
                        <i className="fas fa-credit-card"></i>
                    </div>
                    <h2>Service Payment</h2>
                </div>

                <div className="payment-details-summary">
                    <div className="payment-row">
                        <span className="payment-label">Service:</span>
                        <span className="payment-value">{application.serviceType || 'General Service'}</span>
                    </div>
                    <div className="payment-row">
                        <span className="payment-label">Application ID:</span>
                        <span className="payment-value">{application.applicationId || application._id}</span>
                    </div>
                    <div className="payment-row">
                        <span className="payment-label">Amount:</span>
                        <span className="payment-value">{application.fee || 100} ETB</span>
                    </div>
                </div>

                <div className="payment-form">
                    <label htmlFor="phone">Phone Number (for Chapa)</label>
                    <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="09..."
                    />
                </div>

                {error && <p className="payment-error-message">{error}</p>}

                <div className="payment-modal-footer">
                    <button className="cancel-btn" onClick={onClose} disabled={contextIsProcessing}>
                        Cancel
                    </button>
                    <button className="pay-btn" onClick={handlePay} disabled={contextIsProcessing}>
                        {contextIsProcessing ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Processing...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-credit-card"></i> Pay Now
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
