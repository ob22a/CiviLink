/**
 * Loading Spinner Component
 * 
 * Reusable full-container loading state with a rotating spinner.
 * Used for data fetching states across admin pages.
 */

import React from 'react';
import '../../styles/components/LoadingSpinner.css';

const LoadingSpinner = ({ message = "Loading data..." }) => {
    return (
        <div className="loading-spinner-container">
            <div className="spinner-icon">
                <i className="fas fa-circle-notch fa-spin"></i>
            </div>
            <p className="loading-message">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
