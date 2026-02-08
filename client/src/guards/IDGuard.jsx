import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfileAssets } from '../hooks/useProfileAssets';
import '../styles/auth/IDGuard.css';

export const IDGuard = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  const { idStatus, isLoading, fetchIdData } = useProfileAssets();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch fresh status on mount if citizen
    if (isAuthenticated && role === 'citizen') {
      fetchIdData();
    }
  }, [isAuthenticated, role, fetchIdData]);

  // Not a citizen, allow access
  if (!isAuthenticated || role !== 'citizen') {
    return children;
  }

  if (isLoading) {
    return (
      <div className="id-guard-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Checking ID verification status...</p>
      </div>
    );
  }

  // If status is not BOTH, show the block screen instead of children
  if (idStatus !== 'BOTH') {
    return (
      <div className="id-guard-block-screen">
        <div className="id-guard-block-content">
          <div className="id-guard-block-header">
            <i className="fas fa-lock"></i>
            <h2>Verification Required</h2>
          </div>
          <div className="id-guard-block-body">
            <p>
              You must upload both <strong>Fayda ID</strong> and <strong>Kebele ID</strong> documents before you can access this page.
            </p>
            <p className="id-guard-info">
              Please complete your ID verification in the Settings page to unlock applications.
            </p>
          </div>
          <div className="id-guard-block-footer">
            <button
              className="id-guard-btn-primary"
              onClick={() => navigate('/user/settings')}
            >
              Go to Settings
            </button>
            <button
              className="id-guard-btn-secondary"
              onClick={() => navigate('/user/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="id-guard-content">
      {children}
    </div>
  );
};

export default IDGuard;

