import React, { useState, useEffect } from 'react';
import '../../styles/admin/AdminDashboard.css';
import Navigation2 from '../../components/Navigation2.jsx';
import Footer from '../../components/Footer.jsx';
import AdminSideBar from '../../components/AdminSideBar.jsx';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDuration } from '../../utils/formatters';

function AdminDashboard() {
  const { fetchDashboardData, loading, error } = useAdmin();
  const [data, setData] = useState({
    metrics: null,
    logs: null,
    officerStats: null
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const { metrics, logs, officerStats } = await fetchDashboardData();
        setData({ metrics, logs, officerStats });
      } catch (err) {
        console.error("Dashboard load failed", err);
      }
    };
    loadData();
  }, [fetchDashboardData]);

  const { metrics, logs, officerStats } = data;

  const dashboardData = {
    stats: {
      totalOfficers: officerStats?.counts?.total || officerStats?.data?.totalDocs || 0,
      activeRequests: metrics?.data?.summary?.totalRequestsProcessed || 0,
      avgResponseTime: metrics?.data?.summary?.averageResponseTimeMs ? formatDuration(metrics.data.summary.averageResponseTimeMs) : 'N/A',
      securityAlerts: logs?.totalDocs || 0
    },
    officerStats: {
      active: officerStats?.counts?.active || officerStats?.data?.totalDocs || 0,
      pending: 0,
      departments: metrics?.data?.topPerformers ? new Set(metrics.data.topPerformers.map(p => p.department)).size : 0
    },
    performanceMetrics: {
      requestsProcessed: metrics?.data?.summary?.totalRequestsProcessed || 0,
      avgResponseTime: metrics?.data?.summary?.averageResponseTimeMs ? formatDuration(metrics.data.summary.averageResponseTimeMs) : 'N/A',
      responseRate: metrics?.data?.summary?.communicationResponseRate ? `${(metrics.data.summary.communicationResponseRate * 100).toFixed(2)}%` : 'N/A'
    },
    securityIssues: {
      failedLogins: 0,
      afterHourLogins: 0,
      otherThreats: logs?.totalDocs || 0
    },
    recentActivities: (logs?.reports || []).slice(0, 3).map((log, index) => {
      const isHigh = ['UNAUTHORIZED_ACCESS', 'LOGIN_FAILURE', 'LOGIN_FAILED'].includes(log.attemptType);
      const isMedium = ['TOKEN_EXPIRED'].includes(log.attemptType);
      return {
        id: index,
        type: isHigh ? 'exclamation-circle' : isMedium ? 'exclamation-triangle' : 'info-circle',
        title: log.attemptType,
        description: log.officerName,
        time: new Date(log.timeOfAttempt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    })
  };

  if (loading && !metrics) {
    return (
      <>
        <Navigation2 />
        <div className="admin-dashboard">
          <AdminSideBar />
          <main className="main-content">
            <LoadingSpinner message="Loading Dashboard..." />
          </main>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation2 />
        <div className="admin-dashboard">
          <AdminSideBar />
          <main className="main-content">
            <div className="error-message">Error loading dashboard: {error}</div>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation2 />
      <div className="admin-dashboard">
        <AdminSideBar />
        <main className="main-content">
          <div className="content-header">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, Administrator. Here's what's happening today.</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e3f2fd' }}>
                <i className="fas fa-users" style={{ color: '#1976d2' }}></i>
              </div>
              <div className="stat-info">
                <h3>{dashboardData.stats.totalOfficers.toLocaleString()}</h3>
                <p>Total Officers</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e8f5e9' }}>
                <i className="fas fa-tasks" style={{ color: '#388e3c' }}></i>
              </div>
              <div className="stat-info">
                <h3>{dashboardData.stats.activeRequests.toLocaleString()}</h3>
                <p>Active Requests</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fff3e0' }}>
                <i className="fas fa-clock" style={{ color: '#f57c00' }}></i>
              </div>
              <div className="stat-info">
                <h3>{dashboardData.stats.avgResponseTime}</h3>
                <p>Avg. Response Time</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ffebee' }}>
                <i className="fas fa-exclamation-triangle" style={{ color: '#d32f2f' }}></i>
              </div>
              <div className="stat-info">
                <h3>{dashboardData.stats.securityAlerts}</h3>
                <p>Security Alerts</p>
              </div>
            </div>
          </div>

          {/* Admin Cards */}
          <div className="admin-cards">
            {/* Manage Officers Card */}
            <div className="admin-card">
              <div className="card-header">
                <div className="card-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="card-title">
                  <h3>Manage Officers</h3>
                  <p>Add, edit, or remove officers</p>
                </div>
              </div>
              <div className="card-content">
                <p>
                  Manage officer accounts, roles, and permissions across the
                  system.
                </p>
                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-value">{dashboardData.officerStats.active}</span>
                    <span className="stat-label">Active</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{dashboardData.officerStats.departments}</span>
                    <span className="stat-label">Departments</span>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <a href="/admin/manage-officers" className="card-link">
                  Go to Manage Officers →
                </a>
              </div>
            </div>

            {/* Performance Monitoring Card */}
            <div className="admin-card">
              <div className="card-header">
                <div className="card-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="card-title">
                  <h3>Performance Monitoring</h3>
                  <p>Track officer performance</p>
                </div>
              </div>
              <div className="card-content">
                <p>Monitor officer metrics and track performance over time.</p>
                <div className="card-metrics">
                  <div className="metric">
                    <span className="metric-label">Requests Processed:</span>
                    <span className="metric-value">{dashboardData.performanceMetrics.requestsProcessed.toLocaleString()}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Avg. Response Time:</span>
                    <span className="metric-value">{dashboardData.performanceMetrics.avgResponseTime}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Response Rate:</span>
                    <span className="metric-value">{dashboardData.performanceMetrics.responseRate}</span>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <a href="/admin/performance" className="card-link">View Details →</a>
              </div>
            </div>

            {/* Security Report Card */}
            <div className="admin-card">
              <div className="card-header">
                <div className="card-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="card-title">
                  <h3>Security Report</h3>
                  <p>System security overview</p>
                </div>
              </div>
              <div className="card-content">
                <p>Review security logs and monitor system threats.</p>
                <div className="security-issues">
                  <div className="issue">
                    <i className="fas fa-exclamation-triangle" style={{ color: '#d32f2f' }}></i>
                    <span>Failed Logins: <strong>{dashboardData.securityIssues.failedLogins}</strong></span>
                  </div>
                  <div className="issue">
                    <i className="fas fa-clock" style={{ color: '#f57c00' }}></i>
                    <span>After-Hour Logins: <strong>{dashboardData.securityIssues.afterHourLogins}</strong></span>
                  </div>
                  <div className="issue">
                    <i className="fas fa-bug" style={{ color: '#7b1fa2' }}></i>
                    <span>Other Threats: <strong>{dashboardData.securityIssues.otherThreats}</strong></span>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <a href="/admin/security" className="card-link">View Report →</a>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.map(activity => (
                  <div className="activity-item" key={activity.id}>
                    <div className="activity-icon">
                      <i className={`fas fa-${activity.type}`}></i>
                    </div>
                    <div className="activity-content">
                      <p>
                        <strong>{activity.title}</strong> {activity.description}
                      </p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-activity">No recent activity found.</p>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default AdminDashboard;