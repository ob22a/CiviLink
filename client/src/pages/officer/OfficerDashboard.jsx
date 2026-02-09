import React, { useState, useEffect } from 'react';
import '../../styles/officer/OfficerDashboard.css';
import Navigation2 from '../../components/Navigation2';
import Footer from '../../components/Footer';
import OfficerSideBar from '../../components/OfficerSideBar';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout.jsx';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions.js';
import * as officerAPI from '../../api/officer.api.js';
import { useChat } from '../../hooks/useChat';
import { useNavigate } from 'react-router-dom';


function OfficerDashboard() {
    const { user } = useAuth();
    const { canApprove, canSupport } = usePermissions();
    const navigate = useNavigate();

    // Dashboard metrics state
    // NOTE: These metrics are currently static as there is no specific officer metrics API.
    // They are kept here for UI demonstration purposes.
    const [dashboardMetrics, setDashboardMetrics] = useState({
        pendingApplications: 0,
        todayCompleted: 0,
        averageProcessingTime: '0.0',
        approvalRate: '0%'
    });

    // Application queue state
    const [applicationsQueue, setApplicationsQueue] = useState([]);
    const [conversationsQueue, setConversationsQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Recent activities state
    // NOTE: This section is currently static as there is no officer activities API.
    const [recentActivities, setRecentActivities] = useState([]);


    // Performance metrics state
    // NOTE: Performance data is currently static.
    const [performanceMetrics, setPerformanceMetrics] = useState({
        monthlyTarget: 150,
        currentCompleted: 112,
        efficiencyScore: '92%',
        qualityRating: '4.8/5.0'
    });

    const { fetchConversations, conversations: contextConversations } = useChat();

    // Fetch data based on role
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch metrics regardless of sub-role
                const metricsResponse = await officerAPI.getOfficerMetrics();
                if (metricsResponse.success) setDashboardMetrics(metricsResponse.data);

                // Fetch activities
                const activitiesResponse = await officerAPI.getOfficerActivities();
                if (activitiesResponse.success) setRecentActivities(activitiesResponse.data);

                if (canApprove) {
                    const appResponse = await officerAPI.getOfficerApplications();
                    // Limit to 5 for home page display
                    const apps = appResponse.data || [];
                    setApplicationsQueue(apps.slice(0, 5));
                }

                if (canSupport) {
                    fetchConversations(1, 5);
                }
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [canApprove, canSupport, fetchConversations]);

    // Update local conversations queue when context state changes
    useEffect(() => {
        if (contextConversations) {
            setConversationsQueue(contextConversations.slice(0, 5));
        }
    }, [contextConversations]);

    // Derived stats from applications queue
    const quickStats = {
        totalApplications: applicationsQueue.length,
        pendingReview: applicationsQueue.filter(app => app.status === 'pending').length,
        completed: applicationsQueue.filter(app => app.status === 'approved' || app.status === 'rejected').length
    };

    // Handle next application click
    const handleNextApplication = () => {
        if (applicationsQueue.length > 0) {
            navigate(`/ officer / applications / ${applicationsQueue[0]._id} `);
        } else {
            alert('No pending applications in queue');
        }
    };

    // Handle next chat click
    const handleNextChat = () => {
        if (conversationsQueue.length > 0) {
            navigate(`/ officer / messages`);
        } else {
            alert('No pending chats in queue');
        }
    };


    // Handle view application details
    const handleViewApplication = (appId) => {
        alert(`Viewing application: ${appId} `);
        // In real app, navigate to application details
    };

    // Handle reassign application
    const handleReassignApplication = (appId) => {
        alert(`Reassigning application: ${appId} `);
        // In real app, open reassign modal
    };

    // Handle quick status update
    const handleQuickStatusUpdate = (appId, newStatus) => {
        setApplicationsQueue(prev =>
            prev.map(app =>
                app.id === appId ? { ...app, status: newStatus } : app
            )
        );
        alert(`Application ${appId} status updated to: ${newStatus} `);
    };

    // Calculate completion percentage for monthly target
    const calculateCompletionPercentage = () => {
        return (performanceMetrics.currentCompleted / performanceMetrics.monthlyTarget) * 100;
    };


    // Calculate status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { text: 'Pending Review', color: '#f59e0b', bg: '#fffbeb' },
            doc_review: { text: 'Document Review', color: '#3b82f6', bg: '#eff6ff' },
            verification: { text: 'Verification', color: '#8b5cf6', bg: '#f5f3ff' },
            approved: { text: 'Approved', color: '#10b981', bg: '#ecfdf5' },
            rejected: { text: 'Rejected', color: '#ef4444', bg: '#fef2f2' }
        };
        return statusConfig[status] || { text: status, color: '#64748b', bg: '#f1f5f9' };
    };

    return (
        <AuthenticatedLayout showSidebar={true}>
            <div className="officer-dashboard">
                <div className="dashboard-header">
                    <div className="header-left">
                        <h1><i className="fas fa-tachometer-alt"></i> Officer Dashboard</h1>
                        <p className="welcome-text">Welcome back, {user?.fullName || 'Officer'}. Here's your workload overview.</p>
                    </div>
                    <div className="header-right">
                        <div className="current-time">
                            <i className="fas fa-clock"></i>
                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {canApprove && (
                            <button className="next-app-btn" onClick={handleNextApplication}>
                                <i className="fas fa-forward"></i> Review Next Application
                            </button>
                        )}
                        {canSupport && !canApprove && (
                            <button className="next-app-btn" onClick={handleNextChat}>
                                <i className="fas fa-comments"></i> Respond to Next Chat
                            </button>
                        )}
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-icon pending">
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="metric-content">
                            <h3>Pending Applications</h3>
                            <div className="metric-value">{dashboardMetrics.pendingApplications}</div>
                            <div className="metric-trend">
                                <i className="fas fa-arrow-up trend-up"></i>
                                <span>+2 from yesterday</span>
                            </div>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon completed">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="metric-content">
                            <h3>Today's Completed</h3>
                            <div className="metric-value">{dashboardMetrics.todayCompleted}</div>
                            <div className="metric-trend">
                                <i className="fas fa-arrow-up trend-up"></i>
                                <span>On track for daily target</span>
                            </div>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon time">
                            <i className="fas fa-stopwatch"></i>
                        </div>
                        <div className="metric-content">
                            <h3>Avg. Processing Time</h3>
                            <div className="metric-value">{dashboardMetrics.averageProcessingTime} days</div>
                            <div className="metric-trend">
                                <i className="fas fa-arrow-down trend-down"></i>
                                <span>-0.5 days from last week</span>
                            </div>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon approval">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <div className="metric-content">
                            <h3>Approval Rate</h3>
                            <div className="metric-value">{dashboardMetrics.approvalRate}</div>
                            <div className="metric-trend">
                                <i className="fas fa-arrow-up trend-up"></i>
                                <span>+2% from last month</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="main-content-grid">
                    {/* Left Column: Applications or Communications Queue */}
                    <div className="content-column">
                        <div className="content-card">
                            {canApprove ? (
                                <>
                                    <div className="card-header">
                                        <h2><i className="fas fa-list"></i> Applications Queue</h2>
                                        <span className="badge-count">{applicationsQueue.length}</span>
                                    </div>

                                    <div className="queue-filters">
                                        <button className="filter-btn active">All</button>
                                        <button className="filter-btn">Pending</button>
                                        <button className="filter-btn">Overdue</button>
                                    </div>
                                </>
                            ) : canSupport ? (
                                <>
                                    <div className="card-header">
                                        <h2><i className="fas fa-comments"></i> Communications Queue</h2>
                                        <span className="badge-count">{conversationsQueue.length}</span>
                                    </div>
                                    <div className="queue-filters">
                                        <button className="filter-btn active">Recent</button>
                                        <button className="filter-btn">Unread</button>
                                    </div>
                                </>
                            ) : null}

                            <div className="applications-list">
                                {isLoading ? (
                                    <div className="loading-spinner">Loading workload...</div>
                                ) : (canApprove && applicationsQueue.length > 0) ? (
                                    applicationsQueue.map((app) => {
                                        const statusBadge = getStatusBadge(app.status);
                                        return (
                                            <div key={app._id} className="application-item">
                                                <div className="app-info">
                                                    <div className="app-id">{app.applicationId || app._id.substring(0, 8)}</div>
                                                    <div className="app-type">{app.type}</div>
                                                    <div className="app-applicant">{app.applicantName || 'Applicant'}</div>
                                                </div>

                                                <div className="app-details">
                                                    <span
                                                        className="status-badge"
                                                        style={{
                                                            color: statusBadge.color,
                                                            backgroundColor: statusBadge.bg
                                                        }}
                                                    >
                                                        {statusBadge.text}
                                                    </span>
                                                    <span className="days-pending">Recent</span>
                                                </div>

                                                <div className="app-actions">
                                                    <button className="action-btn view" onClick={() => handleViewApplication(app._id)} title="View Detail">
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button className="action-btn approve" onClick={() => handleQuickStatusUpdate(app._id, 'approved')} title="Quick Approve">
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (canSupport && conversationsQueue.length > 0) ? (
                                    conversationsQueue.map((chat) => (
                                        <div key={chat._id} className="application-item chat-item">
                                            <div className="app-info">
                                                <div className="app-id">{chat.subject}</div>
                                                <div className="app-applicant">From: {chat.citizenId?.fullName || 'Citizen'}</div>
                                            </div>
                                            <div className="app-details">
                                                <span className={`status - badge ${chat.read ? 'read' : 'unread'} `} style={{
                                                    background: chat.read ? '#f1f5f9' : '#eff6ff',
                                                    color: chat.read ? '#64748b' : '#3b82f6'
                                                }}>
                                                    {chat.read ? 'Read' : 'Unread'}
                                                </span>
                                                <span className="days-pending">Status: {chat.status}</span>
                                            </div>
                                            <div className="app-actions">
                                                <button className="action-btn view" onClick={() => navigate('/officer/messages')} title="Go to Message Center">
                                                    <i className="fas fa-reply"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">No items in your queue</div>
                                )}
                            </div>

                            <div className="card-footer">
                                <button className="view-all-btn">
                                    View All Applications <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Quick Stats & Recent Activity */}
                    <div className="content-column">
                        {/* Performance Metrics */}
                        <div className="content-card">
                            <div className="card-header">
                                <h2><i className="fas fa-chart-bar"></i> Monthly Performance</h2>
                            </div>

                            <div className="performance-metrics">
                                <div className="target-progress">
                                    <div className="progress-header">
                                        <span>Monthly Target: {performanceMetrics.monthlyTarget} applications</span>
                                        <span>{performanceMetrics.currentCompleted} completed</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${calculateCompletionPercentage()}% ` }}
                                        ></div>
                                    </div>
                                    <div className="progress-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">Efficiency Score</span>
                                            <span className="stat-value success">{performanceMetrics.efficiencyScore}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Quality Rating</span>
                                            <span className="stat-value">{performanceMetrics.qualityRating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="content-card">
                            <div className="card-header">
                                <h2><i className="fas fa-history"></i> Recent Activity</h2>
                            </div>
                            <div className="activities-list">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map((activity) => (
                                        <div key={activity.id} className="activity-item">
                                            <div className="activity-icon">
                                                <i className="fas fa-edit"></i>
                                            </div>
                                            <div className="activity-info">
                                                <div className="activity-action">{activity.action}</div>
                                                <div className="activity-details">
                                                    <span className="app-id">{activity.applicationId}</span>
                                                    <span className="activity-time">{new Date(activity.time).toLocaleTimeString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">No recent activities</div>
                                )}
                            </div>
                        </div>


                    </div>
                </div>

                {/* Quick Stats Bar */}
                <div className="quick-stats-bar">
                    <div className="stat-item">
                        <i className="fas fa-file-alt"></i>
                        <div className="stat-content">
                            <div className="stat-value">{quickStats.totalApplications}</div>
                            <div className="stat-label">Total Applications</div>
                        </div>
                    </div>

                    <div className="stat-item">
                        <i className="fas fa-clock"></i>
                        <div className="stat-content">
                            <div className="stat-value">{quickStats.pendingReview}</div>
                            <div className="stat-label">Pending Review</div>
                        </div>
                    </div>

                    <div className="stat-item">
                        <i className="fas fa-file-upload"></i>
                        <div className="stat-content">
                            <div className="stat-value">{quickStats.awaitingDocuments}</div>
                            <div className="stat-label">Awaiting Documents</div>
                        </div>
                    </div>

                    <div className="stat-item">
                        <i className="fas fa-check-circle"></i>
                        <div className="stat-content">
                            <div className="stat-value">{quickStats.readyForApproval}</div>
                            <div className="stat-label">Ready for Approval</div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default OfficerDashboard;