/**
 * Logout Confirmation Modal
 * 
 * Displays a confirmation dialog before logging out.
 */

import React from 'react';
import '../../styles/components/LogoutModal.css';

export const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onCancel}>
      <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-header">
          <i className="fas fa-sign-out-alt"></i>
          <h2>Confirm Logout</h2>
        </div>
        <div className="logout-modal-body">
          <p>Are you sure you want to log out?</p>
          <p className="logout-warning">
            You will need to log in again to access your account.
          </p>
        </div>
        <div className="logout-modal-footer">
          <button className="logout-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="logout-btn-confirm" onClick={onConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;

