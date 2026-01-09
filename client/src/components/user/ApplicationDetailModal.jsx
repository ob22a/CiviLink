import React from 'react';
import '../../styles/user/ApplicationDetailModal.css';

const ApplicationDetailModal = ({ isOpen, onClose, application, onDownloadCertificate, onDownloadReceipt }) => {
    if (!isOpen || !application) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getServiceTitle = () => {
        if (application.category === 'tin') return 'TIN Registration';
        if (application.category === 'vital') {
            if (application.type === 'birth') return 'Birth Certificate';
            if (application.type === 'marriage') return 'Marriage Certificate';
            return 'Vital Certificate';
        }
        return 'Application';
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            submitted: 'status-submitted',
            processing: 'status-processing',
            approved: 'status-approved',
            completed: 'status-completed',
            rejected: 'status-rejected'
        };
        return statusMap[status] || 'status-default';
    };

    const renderFormData = () => {
        if (!application.formData) return <p>No specific form data available.</p>;

        // Exclude internal/technical fields from display
        const excludedFields = ['paymentId', 'faydaId', 'kebeleId', 'transactionId'];

        return (
            <div className="form-data-grid">
                {Object.entries(application.formData).map(([key, value]) => {
                    if (excludedFields.includes(key) || typeof value === 'object' || !value) return null;

                    // Format keys for readability (e.g. fullName -> Full Name)
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                    return (
                        <div key={key} className="data-item">
                            <span className="data-label">{label}</span>
                            <span className="data-value">{value}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-info">
                        <h2>{getServiceTitle()}</h2>
                        <span className="app-id">ID: {application._id}</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="status-banner">
                        <span className={`status-pill ${getStatusBadgeClass(application.status)}`}>
                            {application.status.toUpperCase()}
                        </span>
                        <span className="submission-date">Submitted on {formatDate(application.createdAt)}</span>
                    </div>

                    <section className="detail-section">
                        <h3><i className="fas fa-info-circle"></i> Application Information</h3>
                        {renderFormData()}
                    </section>

                    {application.rejectionReason && (
                        <section className="detail-section rejection-section">
                            <h3><i className="fas fa-exclamation-triangle"></i> Rejection Reason</h3>
                            <p>{application.rejectionReason}</p>
                        </section>
                    )}

                    <section className="detail-section action-section">
                        <h3><i className="fas fa-file-download"></i> Available Documents</h3>
                        <div className="document-actions">
                            {(application.status === 'approved' || application.status === 'completed') && (
                                <button
                                    className="download-btn certificate"
                                    onClick={() => onDownloadCertificate(application._id)}
                                >
                                    <i className="fas fa-certificate"></i> Download Certificate
                                </button>
                            )}
                            {application.formData?.paymentId && (
                                <button
                                    className="download-btn receipt"
                                    onClick={() => onDownloadReceipt(application.formData.paymentId)}
                                >
                                    <i className="fas fa-receipt"></i> Download Payment Receipt
                                </button>
                            )}
                            {!application.formData?.paymentId && (application.status === 'approved' || application.status === 'completed') && (
                                <p className="no-docs">No additional documents available for download.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailModal;
