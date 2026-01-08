/**
 * Status Modal Component
 * 
 * Displays success or error messages with appropriate styling.
 * Used for feedback after actions like password changes.
 */

import React from 'react';
import '../../styles/components/StatusModal.css';

const StatusModal = ({ isOpen, onClose, status, title, message }) => {
    if (!isOpen) return null;

    const isSuccess = status === 'success';

    return (
        <div className="status-modal-overlay" onClick={onClose}>
            <div className={`status-modal-content ${status}`} onClick={e => e.stopPropagation()}>
                <div className="status-modal-header">
                    <div className={`status-icon ${status}`}>
                        <i className={isSuccess ? "fas fa-check-circle" : "fas fa-exclamation-circle"}></i>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="status-modal-body">
                    <h3>{title}</h3>
                    <p>{message}</p>
                </div>

                <div className="status-modal-footer">
                    <button
                        className={`action-btn ${status}`}
                        onClick={onClose}
                    >
                        {isSuccess ? 'Continue' : 'Try Again'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusModal;
