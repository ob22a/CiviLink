/**
 * User Dashboard
 * 
 * Citizen dashboard showing:
 * - Quick services
 * - Real application tracking (fetched from backend)
 * - Recent activity
 * 
 * All data is fetched dynamically from backend APIs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { AuthGuard } from '../../guards/AuthGuard.jsx';
import { RoleGuard } from '../../guards/RoleGuard.jsx';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout.jsx';
import * as applicationsAPI from '../../api/applications.api.js';
import NewsSlider from '../../components/NewsSlider.jsx';
import '../../styles/user/UserDashboard.css';
import { Link } from 'react-router-dom';

function UserDashboard() {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user applications
    const fetchApplications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await applicationsAPI.getAllApplications();
            setApplications(response.data || []);
        } catch (err) {
            setError(err.message || 'Failed to load applications');
            setApplications([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Get status display text
    const getStatusText = (status) => {
        const statusMap = {
            submitted: 'Submitted',
            pending: 'Pending',
            processing: 'Processing',
            approved: 'Approved',
            completed: 'Completed',
            rejected: 'Rejected'
        };
        return statusMap[status] || status;
    };

    // Get status badge class
    const getStatusClass = (status) => {
        const classMap = {
            submitted: 'status-submitted',
            pending: 'status-processing',
            processing: 'status-processing',
            approved: 'status-approved',
            completed: 'status-approved',
            rejected: 'status-rejected'
        };
        return classMap[status] || 'status-processing';
    };

    // Get service type name
    const getServiceTypeName = (category, type) => {
        if (category === 'tin') return 'TIN Registration';
        if (category === 'vital') {
            if (type === 'birth') return 'Birth Certificate';
            if (type === 'marriage') return 'Marriage Certificate';
            return 'Vital Certificate';
        }
        return category || 'Application';
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get recent applications (max 5)
    const recentApplications = applications.slice(0, 5);

    return (
        <AuthGuard>
            <RoleGuard allowedRoles="citizen">
                <AuthenticatedLayout showSidebar={true}>
                    <div className="user-dashboard">
                        <main className="main-content">
                            {/* Dynamic News Slider */}
                            <NewsSlider />

                            {/* Quick Services */}
                            <h2 className="section-title">Quick Services</h2>
                            <div className="services-grid">
                                <Link to='/user/tin-form' style={{ textDecoration: 'none' }}>
                                    <div className="service-card">
                                        <div className="service-icon">
                                            <i className="fas fa-fingerprint"></i>
                                        </div>
                                        <h3>Apply for TIN</h3>
                                        <p>Tax Identification Number registration for individuals and businesses</p>
                                        <button className="apply-btn">Start Application</button>
                                    </div>
                                </Link>

                                <Link to='/user/birth-form' style={{ textDecoration: 'none' }}>
                                    <div className="service-card">
                                        <div className="service-icon">
                                            <i className="fas fa-baby"></i>
                                        </div>
                                        <h3>Birth Certificate</h3>
                                        <p>Register new births and obtain official birth certificates</p>
                                        <button className="apply-btn">Start Application</button>
                                    </div>
                                </Link>

                                <Link to='/user/marriage-form' style={{ textDecoration: 'none' }}>
                                    <div className="service-card">
                                        <div className="service-icon">
                                            <i className="fas fa-heart"></i>
                                        </div>
                                        <h3>Marriage Services</h3>
                                        <p>Marriage registration and certificate issuance services</p>
                                        <button className="apply-btn">Start Application</button>
                                    </div>
                                </Link>
                            </div>

                            {/* Application Tracking */}
                            <h2 className="section-title">Application Tracking</h2>

                            {isLoading ? (
                                <div className="loading-state">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <p>Loading applications...</p>
                                </div>
                            ) : error ? (
                                <div className="error-state">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <p>{error}</p>
                                    <button onClick={fetchApplications} className="retry-btn">
                                        Retry
                                    </button>
                                </div>
                            ) : recentApplications.length === 0 ? (
                                <div className="empty-state">
                                    <i className="fas fa-folder-open"></i>
                                    <h3>No Applications Yet</h3>
                                    <p>You haven't submitted any applications yet.</p>
                                    <p className="empty-state-subtitle">Start by selecting a service above to create your first application.</p>
                                </div>
                            ) : (
                                <div className="tracking-grid">
                                    {recentApplications.map((app) => (
                                        <div key={app._id} className="tracking-card">
                                            <div className="tracking-header">
                                                <h3>{getServiceTypeName(app.category, app.type)}</h3>
                                                <span className={`status-badge ${getStatusClass(app.status)}`}>
                                                    {getStatusText(app.status)}
                                                </span>
                                            </div>
                                            <p>Applied on: {formatDate(app.createdAt)}</p>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: app.status === 'completed' ? '100%' :
                                                            app.status === 'approved' ? '80%' :
                                                                app.status === 'processing' ? '50%' :
                                                                    app.status === 'rejected' ? '0%' : '25%'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="tracking-details">
                                                <span>Status:</span>
                                                <span>{getStatusText(app.status)}</span>
                                            </div>
                                            <Link to="/user/applications" className="view-details">
                                                View Details <i className="fas fa-arrow-right"></i>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* View All Applications Link */}
                            {applications.length > 5 && (
                                <div className="view-all-section">
                                    <Link to="/user/applications" className="view-all-link">
                                        View All Applications ({applications.length}) <i className="fas fa-arrow-right"></i>
                                    </Link>
                                </div>
                            )}
                        </main>
                    </div>
                </AuthenticatedLayout>
            </RoleGuard>
        </AuthGuard>
    );
}

export default UserDashboard;
