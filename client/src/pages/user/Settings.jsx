/**
 * Settings Page
 * 
 * User account settings with:
 * - Profile information (read-only, fetched from backend)
 * - Password change
 * - ID verification (Fayda & Kebele - separate flows)
 * - Right to Be Forgotten
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { AuthGuard } from '../../auth/guards/AuthGuard.jsx';
import { useProfileAssets } from '../../auth/ProfileAssetsContext.jsx';
import { RoleGuard } from '../../auth/guards/RoleGuard.jsx';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout.jsx';
import LogoutModal from '../../components/common/LogoutModal.jsx';
import * as userAPI from '../../api/user.api.js';
import '../../styles/user/Settings.css';

function Settings() {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();
    const isCitizen = role === 'citizen';

    // Contexts
    const {
        idStatus,
        uploadFayda,
        uploadKebele,
        deleteId,
        isLoading: isLoadingIdStatus,
        fetchIdData
    } = useProfileAssets();

    // Password management
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // ID verification local UI state
    // We keep file selection local until upload
    const [faydaFile, setFaydaFile] = useState(null);
    const [faydaMessage, setFaydaMessage] = useState(null);
    const [faydaUploading, setFaydaUploading] = useState(false);
    const [kebeleFile, setKebeleFile] = useState(null);
    const [kebeleMessage, setKebeleMessage] = useState(null);
    const [kebeleUploading, setKebeleUploading] = useState(false);

    // Right to Be Forgotten / ID Deletion UI
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteType, setDeleteType] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Logout
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        // Fetch fresh data when entering settings
        if (isCitizen) {
            fetchIdData();
        }
    }, [isCitizen, fetchIdData]);

    // Handle password change
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        setPasswordError(null);
        setPasswordSuccess(null);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        setIsChangingPassword(true);
        try {
            await userAPI.changePassword(passwordData);
            setPasswordSuccess('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            setPasswordError(err.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Handle Fayda ID upload
    const handleFaydaFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setFaydaMessage({ type: 'error', text: 'File size must be less than 5MB' });
                return;
            }
            setFaydaFile(file);
            setFaydaMessage(null);
        }
    };

    const handleFaydaUpload = async () => {
        if (!faydaFile) {
            setFaydaMessage({ type: 'error', text: 'Please select a file' });
            return;
        }

        setFaydaUploading(true);
        setFaydaMessage({ type: 'info', text: 'Uploading...' });
        const result = await uploadFayda(faydaFile);
        setFaydaUploading(false);

        if (result.success) {
            setFaydaMessage({ type: 'success', text: 'Fayda ID uploaded successfully!' });
            setFaydaFile(null);
        } else {
            setFaydaMessage({ type: 'error', text: result.error || 'Failed to upload' });
        }
    };

    // Handle Kebele ID upload
    const handleKebeleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setKebeleMessage({ type: 'error', text: 'File size must be less than 5MB' });
                return;
            }
            setKebeleFile(file);
            setKebeleMessage(null);
        }
    };

    const handleKebeleUpload = async () => {
        if (!kebeleFile) {
            setKebeleMessage({ type: 'error', text: 'Please select a file' });
            return;
        }

        setKebeleUploading(true);
        setKebeleMessage({ type: 'info', text: 'Uploading...' });
        const result = await uploadKebele(kebeleFile);
        setKebeleUploading(false);

        if (result.success) {
            setKebeleMessage({ type: 'success', text: 'Kebele ID uploaded successfully!' });
            setKebeleFile(null);
        } else {
            setKebeleMessage({ type: 'error', text: result.error || 'Failed to upload' });
        }
    };

    // Handle Right to Be Forgotten
    const handleDeleteClick = (type) => {
        setDeleteType(type);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        // Call context delete
        const result = await deleteId(deleteType);

        if (result.success) {
            setShowDeleteModal(false);
            setDeleteType(null);
            alert(`${deleteType === 'both' ? 'All ID information' : deleteType === 'fayda' ? 'Fayda ID' : 'Kebele ID'} deleted successfully.`);
        } else {
            alert(`Failed to delete: ${result.error}`);
        }
        setIsDeleting(false);
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = async () => {
        setShowLogoutModal(false);
        await logout();
        navigate('/login');
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDeleteType(null);
        setIsDeleting(false);
    };

    return (
        <AuthGuard>
            <RoleGuard allowedRoles={['citizen']}>
                <AuthenticatedLayout>
                    <div className="user-settings">
                        <div className="settings-header">
                            <h1><i className="fas fa-cog"></i> Account Settings</h1>
                            <p>Manage your profile, security, and privacy preferences</p>
                        </div>

                        <div className="settings-content">
                            {/* Profile Information Section */}
                            <section className="settings-section">
                                <div className="section-header">
                                    <h2><i className="fas fa-user"></i> Profile Information</h2>
                                    <p className="section-description">Your account information (read-only)</p>
                                </div>

                                <div className="profile-display">
                                    <div className="profile-field">
                                        <label>Full Name</label>
                                        <div className="profile-value">{user?.fullName || 'N/A'}</div>
                                    </div>
                                    <div className="profile-field">
                                        <label>Email</label>
                                        <div className="profile-value">{user?.email || 'N/A'}</div>
                                    </div>
                                    <div className="profile-field">
                                        <label>Role</label>
                                        <div className="profile-value">{user?.role || 'N/A'}</div>
                                    </div>
                                </div>
                            </section>

                            <hr className="section-divider" />

                            {/* Password Management Section */}
                            <section className="settings-section">
                                <div className="section-header">
                                    <h2><i className="fas fa-lock"></i> Password Management</h2>
                                    <p className="section-description">Secure your account by changing your password regularly.</p>
                                </div>

                                <form onSubmit={handleChangePassword} className="settings-form">
                                    {passwordError && (
                                        <div className="error-message">
                                            <i className="fas fa-exclamation-circle"></i>
                                            {passwordError}
                                        </div>
                                    )}
                                    {passwordSuccess && (
                                        <div className="success-message">
                                            <i className="fas fa-check-circle"></i>
                                            {passwordSuccess}
                                        </div>
                                    )}

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="currentPassword">Current Password</label>
                                            <input
                                                type="password"
                                                id="currentPassword"
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter current password"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="newPassword">New Password</label>
                                            <input
                                                type="password"
                                                id="newPassword"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter new password"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="confirmPassword">Confirm New Password</label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Confirm new password"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="password-requirements">
                                        <h4>Password Requirements:</h4>
                                        <ul>
                                            <li><i className="fas fa-check-circle"></i> Minimum 8 characters</li>
                                            <li><i className="fas fa-check-circle"></i> At least 1 uppercase letter</li>
                                            <li><i className="fas fa-check-circle"></i> At least 1 number</li>
                                            <li><i className="fas fa-check-circle"></i> At least 1 special character</li>
                                        </ul>
                                    </div>

                                    <button type="submit" className="save-btn" disabled={isChangingPassword}>
                                        <i className="fas fa-lock"></i> {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                                    </button>
                                </form>
                            </section>

                            <hr className="section-divider" />

                            {/* ID Verification Section - Only for Citizens */}
                            {isCitizen && (
                                <section className="settings-section">
                                    <div className="section-header">
                                        <h2><i className="fas fa-id-card"></i> ID Verification</h2>
                                        <p className="section-description">Upload your identification documents for verification.</p>
                                    </div>

                                    {isLoadingIdStatus ? (
                                        <div className="loading-state">
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <p>Loading ID status...</p>
                                        </div>
                                    ) : (
                                        <div className="id-verification-grid">
                                            {/* Fayda ID */}
                                            <div className="id-upload-card">
                                                <div className="card-header">
                                                    <h3><i className="fas fa-id-card"></i> Fayda ID</h3>
                                                    {idStatus === 'ONLY_FAYDA' || idStatus === 'BOTH' ? (
                                                        <span className="verified-badge">
                                                            <i className="fas fa-check-circle"></i> Uploaded
                                                        </span>
                                                    ) : null}
                                                </div>

                                                {idStatus === 'ONLY_FAYDA' || idStatus === 'BOTH' ? (
                                                    <div className="id-uploaded-state">
                                                        <i className="fas fa-check-circle"></i>
                                                        <p>Fayda ID has been uploaded and verified.</p>
                                                        <button
                                                            className="delete-id-btn"
                                                            onClick={() => handleDeleteClick('fayda')}
                                                        >
                                                            <i className="fas fa-trash"></i> Delete Fayda ID
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="id-upload-form">
                                                        <input
                                                            type="file"
                                                            id="faydaUpload"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={handleFaydaFileSelect}
                                                            style={{ display: 'none' }}
                                                        />
                                                        <label htmlFor="faydaUpload" className="file-upload-label">
                                                            <i className="fas fa-upload"></i>
                                                            {faydaFile ? faydaFile.name : 'Choose File'}
                                                        </label>
                                                        {faydaFile && (
                                                            <button
                                                                className="upload-btn"
                                                                onClick={handleFaydaUpload}
                                                                disabled={faydaUploading}
                                                            >
                                                                {faydaUploading ? 'Uploading...' : 'Upload'}
                                                            </button>
                                                        )}
                                                        {faydaMessage && (
                                                            <div className={`message ${faydaMessage.type}`}>
                                                                {faydaMessage.text}
                                                            </div>
                                                        )}
                                                        <p className="upload-hint">Supported: PDF, JPG, PNG (Max 5MB)</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Kebele ID */}
                                            <div className="id-upload-card">
                                                <div className="card-header">
                                                    <h3><i className="fas fa-id-card"></i> Kebele ID</h3>
                                                    {idStatus === 'ONLY_KEBELE' || idStatus === 'BOTH' ? (
                                                        <span className="verified-badge">
                                                            <i className="fas fa-check-circle"></i> Uploaded
                                                        </span>
                                                    ) : null}
                                                </div>

                                                {idStatus === 'ONLY_KEBELE' || idStatus === 'BOTH' ? (
                                                    <div className="id-uploaded-state">
                                                        <i className="fas fa-check-circle"></i>
                                                        <p>Kebele ID has been uploaded and verified.</p>
                                                        <button
                                                            className="delete-id-btn"
                                                            onClick={() => handleDeleteClick('kebele')}
                                                        >
                                                            <i className="fas fa-trash"></i> Delete Kebele ID
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="id-upload-form">
                                                        <input
                                                            type="file"
                                                            id="kebeleUpload"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={handleKebeleFileSelect}
                                                            style={{ display: 'none' }}
                                                        />
                                                        <label htmlFor="kebeleUpload" className="file-upload-label">
                                                            <i className="fas fa-upload"></i>
                                                            {kebeleFile ? kebeleFile.name : 'Choose File'}
                                                        </label>
                                                        {kebeleFile && (
                                                            <button
                                                                className="upload-btn"
                                                                onClick={handleKebeleUpload}
                                                                disabled={kebeleUploading}
                                                            >
                                                                {kebeleUploading ? 'Uploading...' : 'Upload'}
                                                            </button>
                                                        )}
                                                        {kebeleMessage && (
                                                            <div className={`message ${kebeleMessage.type}`}>
                                                                {kebeleMessage.text}
                                                            </div>
                                                        )}
                                                        <p className="upload-hint">Supported: PDF, JPG, PNG (Max 5MB)</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Right to Be Forgotten - Delete All */}
                                    {(idStatus === 'BOTH' || idStatus === 'ONLY_FAYDA' || idStatus === 'ONLY_KEBELE') && (
                                        <div className="right-to-be-forgotten">
                                            <h3><i className="fas fa-user-slash"></i> Right to Be Forgotten</h3>
                                            <p>You have the right to request deletion of all your ID information.</p>
                                            <button
                                                className="delete-all-btn"
                                                onClick={() => handleDeleteClick('both')}
                                            >
                                                <i className="fas fa-trash-alt"></i> Delete All ID Information
                                            </button>
                                        </div>
                                    )}
                                </section>
                            )}
                            <hr className="section-divider" />

                            {/* Logout & Security Section */}
                            <section className="settings-section logout-section">
                                <div className="section-header">
                                    <h2><i className="fas fa-sign-out-alt"></i> Session & Logout</h2>
                                    <p className="section-description">Manage your current session and secure your account.</p>
                                </div>

                                <div className="logout-container">
                                    <p>Ready to leave? Make sure you've saved all your changes before logging out.</p>
                                    <button className="logout-btn-large" onClick={handleLogoutClick}>
                                        <i className="fas fa-sign-out-alt"></i> Logout from CiviLink
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="delete-modal-overlay" onClick={handleDeleteCancel}>
                            <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="delete-modal-header">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <h2>Confirm Deletion</h2>
                                </div>
                                <div className="delete-modal-body">
                                    <p>
                                        Are you sure you want to delete your {
                                            deleteType === 'both' ? 'all ID information' :
                                                deleteType === 'fayda' ? 'Fayda ID' : 'Kebele ID'
                                        }?
                                    </p>
                                    <p className="delete-warning">
                                        This action cannot be undone. You will need to upload your ID again if needed.
                                    </p>
                                </div>
                                <div className="delete-modal-footer">
                                    <button className="cancel-btn" onClick={handleDeleteCancel} disabled={isDeleting}>
                                        Cancel
                                    </button>
                                    <button className="confirm-delete-btn" onClick={handleDeleteConfirm} disabled={isDeleting}>
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logout Confirmation Modal */}
                    <LogoutModal
                        isOpen={showLogoutModal}
                        onConfirm={handleLogoutConfirm}
                        onCancel={handleLogoutCancel}
                    />
                </AuthenticatedLayout>
            </RoleGuard>
        </AuthGuard>
    );
}

export default Settings;
