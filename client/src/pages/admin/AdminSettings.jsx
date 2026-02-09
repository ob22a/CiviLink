/* Imports & Logic Replacement */
import React, { useState } from 'react';
import '../../styles/admin/AdminSettings.css';
import Navigation2 from '../../components/Navigation2';
import Footer from '../../components/Footer';
import AdminSideBar from '../../components/AdminSideBar';
import { useAuth } from '../../hooks/useAuth';
import { changePassword } from '../../api/user.api';
import StatusModal from '../../components/common/StatusModal';

function AdminSettings() {
    const { user } = useAuth();

    // State for password management
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // State for status modal
    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        status: 'success', // 'success' or 'error'
        title: '',
        message: ''
    });

    // State for notifications
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        smsNotifications: false,
        systemAlerts: true,
        securityAlerts: true,
        userActivityAlerts: true,
        performanceAlerts: false,
        backupAlerts: true
    });

    // Handle password input changes
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
            setStatusModal({
                isOpen: true,
                status: 'error',
                title: 'Missing Information',
                message: 'Please enter your current password.'
            });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setStatusModal({
                isOpen: true,
                status: 'error',
                title: 'Password Mismatch',
                message: 'New passwords do not match. Please check and try again.'
            });
            return;
        }

        if (passwordData.newPassword.length < 12) {
            setStatusModal({
                isOpen: true,
                status: 'error',
                title: 'Password Too Weak',
                message: 'Password must be at least 12 characters long for admin accounts.'
            });
            return;
        }

        try {
            await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword
            });

            setStatusModal({
                isOpen: true,
                status: 'success',
                title: 'Password Updated',
                message: 'Your password has been successfully changed.'
            });

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

        } catch (error) {
            setStatusModal({
                isOpen: true,
                status: 'error',
                title: 'Update Failed',
                message: error.message || 'Failed to update password. Please verify current password.'
            });
        }
    };

    // Handle save notification preferences
    const handleSavePreferences = (e) => {
        e.preventDefault();
        console.log('Saving admin preferences:', { notifications });
        // In real app, make API call to save preferences
        alert('Notification preferences saved!');
    };

    return (
        <>
            <Navigation2 />
            <div className="admin-settings">
                <AdminSideBar />

                <StatusModal
                    isOpen={statusModal.isOpen}
                    onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                    status={statusModal.status}
                    title={statusModal.title}
                    message={statusModal.message}
                />

                <main className="main-content">
                    {/* Header */}
                    <div className="settings-header">
                        <h1><i className="fas fa-user-circle"></i> Admin Profile</h1>
                        <p>View administrative account details</p>
                        <div className="role-badge admin-badge">
                            <i className="fas fa-user-shield"></i> {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator'}
                        </div>
                    </div>

                    <div className="settings-content">
                        {/* Admin Info Display (Read-Only) */}
                        <section className="settings-section">
                            <div className="section-header">
                                <h2><i className="fas fa-address-card"></i> Account Information</h2>
                                <p className="section-description">Your system access details.</p>
                            </div>

                            <div className="info-display-card">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Full Name</label>
                                        <div className="info-value">{user?.fullName || 'N/A'}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Email Address</label>
                                        <div className="info-value">{user?.email || 'N/A'}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>User ID</label>
                                        <div className="info-value">{user?._id || user?.id || 'N/A'}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Role</label>
                                        <div className="info-value badge admin-badge">
                                            {user?.role ? user.role.toUpperCase() : 'ADMIN'}
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <label>Department</label>
                                        <div className="info-value">
                                            {user?.department ? user.department.toUpperCase() : 'System Administration'}
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <label>Account Status</label>
                                        <div className="info-value badge active-badge">
                                            <i className="fas fa-check-circle"></i> Active
                                        </div>
                                    </div>
                                </div>

                                <div className="info-note">
                                    <i className="fas fa-info-circle"></i>
                                    <p>
                                        To update your profile information or change your password, please contact the System Administrator or IT Support.
                                        Security settings and notifications are managed centrally.
                                    </p>
                                </div>
                            </div>
                        </section>



                        <hr className="section-divider" />

                        {/* Password Management Section */}
                        <section className="settings-section">
                            <div className="section-header">
                                <h2><i className="fas fa-lock"></i> Password Management</h2>
                                <p className="section-description">Change your admin password with enhanced security requirements.</p> {/* Updated description */}
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
                                    <h4>Admin Password Requirements:</h4> {/* Updated title -->
                                    <ul>
                                        <li><i className="fas fa-check-circle"></i> Minimum 12 characters</li> {/* Increased length */}
                                    <li><i className="fas fa-check-circle"></i> At least 2 uppercase letters</li>
                                    <li><i className="fas fa-check-circle"></i> At least 2 numbers</li>
                                    <li><i className="fas fa-check-circle"></i> At least 2 special characters (!@#$%^&*)</li>
                                    <li><i className="fas fa-check-circle"></i> Different from last 5 passwords</li>
                                    <li><i className="fas fa-check-circle"></i> Must include at least one symbol</li>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="save-btn admin-save-btn">
                                        <i className="fas fa-lock"></i> Change Admin Password
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
                                <h2><i className="fas fa-bell"></i> Admin Notification Preferences</h2>
                                <p className="section-description">Control administrative and system-wide notifications.</p>
                            </div>

                            <form onSubmit={handleSavePreferences} className="settings-form">
                                <div className="preferences-card admin-preferences">
                                    <h3><i className="fas fa-desktop"></i> System & Security Notifications</h3>

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
                                                <span className="checkbox-description">System reports and updates</span>
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
                                                SMS Alerts
                                                <span className="checkbox-description">Critical system alerts</span>
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
                                                System Health Alerts
                                                <span className="checkbox-description">Server and system status</span>
                                            </span>
                                        </label>

                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="securityAlerts"
                                                checked={notifications.securityAlerts}
                                                onChange={handleNotificationChange}
                                            />
                                            <span className="checkbox-custom"></span>
                                            <span className="checkbox-text">
                                                Security Breach Alerts
                                                <span className="checkbox-description">Immediate security incident alerts</span>
                                            </span>
                                        </label>

                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="userActivityAlerts"
                                                checked={notifications.userActivityAlerts}
                                                onChange={handleNotificationChange}
                                            />
                                            <span className="checkbox-custom"></span>
                                            <span className="checkbox-text">
                                                User Activity Monitoring
                                                <span className="checkbox-description">Suspicious user activities</span>
                                            </span>
                                        </label>

                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="performanceAlerts"
                                                checked={notifications.performanceAlerts}
                                                onChange={handleNotificationChange}
                                            />
                                            <span className="checkbox-custom"></span>
                                            <span className="checkbox-text">
                                                Performance Thresholds
                                                <span className="checkbox-description">System performance alerts</span>
                                            </span>
                                        </label>

                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="backupAlerts"
                                                checked={notifications.backupAlerts}
                                                onChange={handleNotificationChange}
                                            />
                                            <span className="checkbox-custom"></span>
                                            <span className="checkbox-text">
                                                Backup Status Alerts
                                                <span className="checkbox-description">Database backup success/failure</span>
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="save-btn admin-save-btn">
                                        <i className="fas fa-save"></i> Save Admin Preferences
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Security Note */}
                        <div className="security-note admin-security-note">
                            <div className="security-icon">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <div className="security-content">
                                <h4>Security Reminder</h4>
                                <ul>
                                    <li>Never share your admin credentials.</li>
                                    <li>Ensure you log out when accessing from public devices.</li>
                                    <li>Report any suspicious activity immediately.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}

export default AdminSettings;