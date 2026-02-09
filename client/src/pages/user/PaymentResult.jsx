/**
 * Payment Result Page
 * 
 * Handles redirect from payment gateway.
 * Verifies transaction using tx_ref from URL.
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePayment } from '../../hooks/usePayment';
import Navigation2 from '../../components/Navigation2';
import Footer from '../../components/Footer';

const PaymentResult = () => {
    const navigate = useNavigate();
    const { verifyPayment } = usePayment();

    const [status, setStatus] = useState('verifying'); // verifying, finalizing, success, failed
    const [message, setMessage] = useState('Verifying payment details...');

    useEffect(() => {
        // Normalize search params to handle things like &amp;
        const searchStr = window.location.search.replace(/&amp;/g, '&');
        const normalizedParams = new URLSearchParams(searchStr);

        const txRef = normalizedParams.get('tx_ref') || normalizedParams.get('trx_ref');
        const appId = normalizedParams.get('appId');
        let category = normalizedParams.get('category');
        let type = normalizedParams.get('type');

        console.log('PaymentResult: Initial Normalized Parameters:', { txRef, appId, category, type });

        const verifyAndFinalize = async () => {
            try {
                let currentTxRef = txRef;
                let resolvedPayment = null;

                // 1. Fallback: If txRef is missing, try to get it from backend via appId
                if (!currentTxRef && appId) {
                    console.log('PaymentResult: Missing txRef, attempting fallback with appId:', appId);
                    setMessage('Retrieving transaction reference...');
                    const paymentAPI = await import('../../api/payment.api.js');
                    const paymentInfo = await paymentAPI.getPaymentByApplicationId(appId);

                    console.log('PaymentResult: Fallback API Response:', paymentInfo);

                    if (paymentInfo.success && paymentInfo.data) {
                        currentTxRef = paymentInfo.data.txRef;
                        resolvedPayment = paymentInfo.data;
                        console.log('PaymentResult: Fallback SUCCESS. Derived txRef:', currentTxRef);
                    } else {
                        console.error('PaymentResult: Fallback FAILED. Response:', paymentInfo);
                    }
                }

                if (!currentTxRef) {
                    console.error('PaymentResult: CRITICAL - No transaction reference could be found.');
                    setStatus('failed');
                    setMessage('No transaction reference found. Please try again or contact support.');
                    return;
                }

                // 2. Verify Payment
                console.log('PaymentResult: Calling verifyPayment with:', currentTxRef);
                const result = await verifyPayment(currentTxRef);
                console.log('PaymentResult: verifyPayment Context Result:', JSON.stringify(result, null, 2));

                const paymentData = result.data?.data || result.data;
                const paymentStatus = paymentData?.status;
                console.log('PaymentResult: Verification status check:', {
                    resultSuccess: result.success,
                    paymentStatus,
                    fullData: paymentData
                });

                if (!result.success || paymentStatus !== 'success') {
                    console.error('PaymentResult: Verification check failed!');
                    setStatus('failed');
                    setMessage(result.error || 'Payment verification failed.');
                    return;
                }

                // 3. Resolve Service Info (Category/Type)
                // If missing from URL, use derived data from resolvedPayment
                if (!category || !type) {
                    console.log('PaymentResult: Missing category/type from URL. Attempting resolution...');

                    // Use resolvedPayment from step 1 or fetch it if needed
                    if (!resolvedPayment && appId) {
                        const paymentAPI = await import('../../api/payment.api.js');
                        const paymentInfo = await paymentAPI.getPaymentByApplicationId(appId);
                        if (paymentInfo.success) resolvedPayment = paymentInfo.data;
                    }

                    if (resolvedPayment) {
                        const sType = (resolvedPayment.serviceType || '').toLowerCase();
                        console.log('PaymentResult: Resolved serviceType from DB:', sType);

                        // Map derived serviceType to required finalization params
                        if (sType === 'tin') {
                            category = 'TIN';
                            type = 'tin';
                        } else if (['birth', 'marriage', 'death'].includes(sType)) {
                            category = 'VITAL';
                            type = sType;
                        }
                    }
                }

                console.log('PaymentResult: Final Service Resolution:', { appId, category, type });

                // 4. Finalize Application if appId is present
                if (appId && category) {
                    setStatus('finalizing');
                    setMessage('Finalizing your application...');
                    console.log(`PaymentResult: Proceeding to finalize ${category}/${type} for appId ${appId}`);

                    const applicationsAPI = await import('../../api/applications.api.js');
                    let finalResult;

                    if (category === 'TIN') {
                        finalResult = await applicationsAPI.finalizeTinApplication(appId);
                    } else if (category === 'VITAL') {
                        finalResult = await applicationsAPI.finalizeVitalApplication(type, appId);
                    }

                    console.log('PaymentResult: Finalization API Response:', finalResult);

                    if (finalResult && finalResult.success) {
                        console.log('PaymentResult: ALL STEPS SUCCESSFUL');
                        setStatus('success');
                        setMessage('Payment verified and application finalized successfully!');
                        // Clear any local storage
                        const lowerType = type ? type.toLowerCase() : (category === 'TIN' ? 'tin' : '');
                        if (lowerType) {
                            console.log('PaymentResult: Cleaning up local storage for:', lowerType);
                            localStorage.removeItem(`pending_app_id_${lowerType}`);
                            localStorage.removeItem(`pending_form_${lowerType}`);
                        }
                    } else {
                        console.error('PaymentResult: Finalization Step FAILED:', finalResult);
                        setStatus('failed');
                        setMessage(finalResult?.message || 'Application finalization failed. Please contact support.');
                    }
                } else {
                    console.log('PaymentResult: Skipping finalization (appId or category missing).');
                    setStatus('success');
                    setMessage('Payment verified successfully!');
                }
            } catch (error) {
                console.error('PaymentResult: CRITICAL PROCESSING ERROR:', error);
                setStatus('failed');
                setMessage('An error occurred while processing your payment results.');
            }
        };

        verifyAndFinalize();
    }, [verifyPayment, navigate]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navigation2 />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
                <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '500px', width: '90%' }}>
                    {status === 'verifying' && (
                        <>
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#3498db', marginBottom: '1.5rem' }}></i>
                            <h2>Verifying Payment</h2>
                            <p>{message}</p>
                        </>
                    )}

                    {status === 'finalizing' && (
                        <>
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#f39c12', marginBottom: '1.5rem' }}></i>
                            <h2>Updating Application</h2>
                            <p>{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <i className="fas fa-check-circle" style={{ fontSize: '3rem', color: '#2ecc71', marginBottom: '1.5rem' }}></i>
                            <h2>Success!</h2>
                            <p style={{ marginBottom: '2rem' }}>Your application has been updated.</p>
                            <button
                                onClick={() => navigate('/user/applications')}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    background: '#2ecc71',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                View Applications
                            </button>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <i className="fas fa-times-circle" style={{ fontSize: '3rem', color: '#e74c3c', marginBottom: '1.5rem' }}></i>
                            <h2>Payment Failed</h2>
                            <p style={{ marginBottom: '2rem' }}>{message}</p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button
                                    onClick={() => navigate('/user/dashboard')}
                                    style={{
                                        padding: '0.8rem 1.5rem',
                                        background: '#95a5a6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/user/applications')}
                                    style={{
                                        padding: '0.8rem 1.5rem',
                                        background: '#3498db',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    My Applications
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentResult;
