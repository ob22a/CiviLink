import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthGuard } from '../../guards/AuthGuard.jsx';
import { RoleGuard } from '../../guards/RoleGuard.jsx';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout.jsx';
import * as userAPI from '../../api/user.api.js';
import '../../styles/officer/OfficerSettings.css';

function OfficerSettings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State for password management
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // State for notifications only
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        smsNotifications: false,
        applicationUpdates: true,
        paymentAlerts: false,
        systemAlerts: true
    });

    // Handle password changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle notification changes
    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotifications(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    // Handle change password
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!passwordData.currentPassword) {
            alert('Please enter your current password');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }

        setIsChangingPassword(true);
        try {
            await userAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword
            });
            alert('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            alert(err.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Handle save notification preferences
    const handleSavePreferences = (e) => {
        e.preventDefault();
        console.log('Saving officer preferences:', { notifications });
        // In real app, make API call to save preferences
        alert('Notification preferences saved!');
    };

    return (
        <AuthGuard>
            <RoleGuard allowedRoles="officer">
                <AuthenticatedLayout>
                    <div className="officer-settings">
                        <div className="settings-header">
                            <h1><i className="fas fa-cog"></i> Officer Settings</h1>
                            <p>Manage your security and notification preferences</p>
                            <div className="role-badge">
                                <i className="fas fa-user-shield"></i> Officer Account
                            </div>
                        </div>

                        <div className="settings-content">
                            {/* Officer Info Display (Read-Only) */}
                            <section className="settings-section">
                                <div className="section-header">
                                    <h2><i className="fas fa-user-tie"></i> Officer Information</h2>
                                    <p className="section-description">Your personal details are managed by the system administrator.</p>
                                </div>

                                <div className="info-display-card">
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Full Name</label>
                                            <div className="info-value">{user?.fullName || 'N/A'}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>Employee ID</label>
                                            <div className="info-value">{user?._id?.substring(0, 8).toUpperCase() || 'OFF-N/A'}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>Department</label>
                                            <div className="info-value">{user?.department || 'N/A'}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>Role</label>
                                            <div className="info-value badge officer-badge">
                                                {user?.department === 'approver' ? 'Verification Officer' : 'Customer Support'}
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <label>Email</label>
                                            <div className="info-value">{user?.email || 'N/A'}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>Account Status</label>
                                            <div className="info-value badge active-badge">
                                                <i className="fas fa-check-circle"></i> {user?.onLeave ? 'On Leave' : 'Active'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-note">
                                        <i className="fas fa-info-circle"></i>
                                        <p>To update personal information, please contact your system administrator.</p>
                                    </div>
                                </div>
                            </section>

                            <hr className="section-divider" />

                            {/* Password Management Section */}
                            <section className="settings-section">
                                <div className="section-header">
                                    <h2><i className="fas fa-lock"></i> Password Management</h2>
                                    <p className="section-description">Change your password to maintain account security.</p>
                                </div>

                                <form onSubmit={handleChangePassword} className="settings-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="currentPassword">Current Password *</label>
                                            <div className="input-with-icon">
                                                <i className="fas fa-key"></i>
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
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="newPassword">New Password *</label>
                                            <div className="input-with-icon">
                                                <i className="fas fa-key"></i>
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
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="confirmPassword">Confirm New Password *</label>
                                            <div className="input-with-icon">
                                                <i className="fas fa-key"></i>
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
                                    </div>

                                    <div className="password-requirements">
                                        <h4>Password Requirements:</h4>
                                        <ul>
                                            <li><i className="fas fa-check-circle"></i> Minimum 8 characters</li>
                                            <li><i className="fas fa-check-circle"></i> At least 1 uppercase letter</li>
                                            <li><i className="fas fa-check-circle"></i> At least 1 number</li>
                                            <li><i className="fas fa-check-circle"></i> At least 1 special character (!@#$%^&*)</li>
                                            <li><i className="fas fa-check-circle"></i> Different from last 3 passwords</li>
                                        </ul>
                                    </div>

                                    <div className="form-actions">
                                        <button type="submit" className="save-btn" disabled={isChangingPassword}>
                                            <i className="fas fa-lock"></i> {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                                        </button>
                                        <button
                                            type="button"
                                            className="cancel-btn"
                                            onClick={() => setPasswordData({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            })}
                                        >
                                            <i className="fas fa-times"></i> Clear
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <hr className="section-divider" />

                            {/* Notification Preferences */}
                            <section className="settings-section">
                                <div className="section-header">
                                    <h2><i className="fas fa-bell"></i> Notification Preferences</h2>
                                    <p className="section-description">Control how you receive system notifications.</p>
                                </div>

                                <form onSubmit={handleSavePreferences} className="settings-form">
                                    <div className="preferences-card">
                                        <h3><i className="fas fa-desktop"></i> System Notifications</h3>

                                        <div className="checkbox-grid">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="emailNotifications"
                                                    checked={notifications.emailNotifications}
                                                    onChange={handleNotificationChange}
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="checkbox-text">
                                                    Email Notifications
                                                    <span className="checkbox-description">Receive important updates via email</span>
                                                </span>
                                            </label>

                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="smsNotifications"
                                                    checked={notifications.smsNotifications}
                                                    onChange={handleNotificationChange}
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="checkbox-text">
                                                    SMS Notifications
                                                    <span className="checkbox-description">Get SMS alerts for urgent matters</span>
                                                </span>
                                            </label>

                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="applicationUpdates"
                                                    checked={notifications.applicationUpdates}
                                                    onChange={handleNotificationChange}
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="checkbox-text">
                                                    Application Updates
                                                    <span className="checkbox-description">Notifications about assigned applications</span>
                                                </span>
                                            </label>

                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="paymentAlerts"
                                                    checked={notifications.paymentAlerts}
                                                    onChange={handleNotificationChange}
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="checkbox-text">
                                                    Payment Alerts
                                                    <span className="checkbox-description">Alerts for payment verifications</span>
                                                </span>
                                            </label>

                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="systemAlerts"
                                                    checked={notifications.systemAlerts}
                                                    onChange={handleNotificationChange}
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="checkbox-text">
                                                    System Alerts
                                                    <span className="checkbox-description">Important system maintenance alerts</span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button type="submit" className="save-btn">
                                            <i className="fas fa-save"></i> Save Preferences
                                        </button>
                                    </div>
                                </form>
                            </section>

                            {/* Security Note */}
                            <div className="security-note">
                                <div className="security-icon">
                                    <i className="fas fa-shield-alt"></i>
                                </div>
                                <div className="security-content">
                                    <h4>Security Best Practices</h4>
                                    <ul>
                                        <li>Change your password every 90 days</li>
                                        <li>Never share your password with anyone</li>
                                        <li>Always log out when using shared computers</li>
                                        <li>Report any suspicious activity immediately</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </AuthenticatedLayout>
            </RoleGuard>
        </AuthGuard>
    );
}

export default OfficerSettings;
