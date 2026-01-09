import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useApplication } from '../../auth/ApplicationContext.jsx';
import { AuthGuard } from '../../auth/guards/AuthGuard.jsx';
import '../../styles/user/Tracking.css';
import Navigation2 from '../../components/Navigation2';
import SideBar1 from '../../components/Sidebar1';
import Footer from '../../components/Footer';
import ApplicationDetailModal from '../../components/user/ApplicationDetailModal';
import * as applicationsAPI from '../../api/applications.api.js'; // Keep for downloadCertificate if not in context

const Tracking = () => {
  const { user } = useAuth();
  const {
    applications,
    isLoading,
    error: contextError,
    fetchApplications,
    getApplicationDetails
  } = useApplication();

  const [filter, setFilter] = useState('all');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [progressSteps, setProgressSteps] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch applications on mount
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Progress steps data based on status
  const getProgressSteps = (status) => {
    const stepsMap = {
      submitted: [
        { step: 'Application Submitted', status: 'completed', date: new Date().toISOString() },
        { step: 'Document Review', status: 'active', date: '' },
        { step: 'Verification', status: 'pending', date: '' },
        { step: 'Processing', status: 'pending', date: '' },
        { step: 'Completed', status: 'pending', date: '' }
      ],
      processing: [
        { step: 'Application Submitted', status: 'completed', date: '' },
        { step: 'Document Review', status: 'completed', date: '' },
        { step: 'Verification', status: 'active', date: '' },
        { step: 'Processing', status: 'pending', date: '' },
        { step: 'Completed', status: 'pending', date: '' }
      ],
      approved: [
        { step: 'Application Submitted', status: 'completed', date: '' },
        { step: 'Document Review', status: 'completed', date: '' },
        { step: 'Verification', status: 'completed', date: '' },
        { step: 'Processing', status: 'completed', date: '' },
        { step: 'Completed', status: 'completed', date: '' }
      ],
      completed: [
        { step: 'Application Submitted', status: 'completed', date: '' },
        { step: 'Document Review', status: 'completed', date: '' },
        { step: 'Verification', status: 'completed', date: '' },
        { step: 'Processing', status: 'completed', date: '' },
        { step: 'Completed', status: 'completed', date: '' }
      ],
      rejected: [
        { step: 'Application Submitted', status: 'completed', date: '' },
        { step: 'Document Review', status: 'completed', date: '' },
        { step: 'Verification', status: 'completed', date: '' },
        { step: 'Processing', status: 'rejected', date: '' },
        { step: 'Completed', status: 'pending', date: '' }
      ]
    };
    return stepsMap[status] || stepsMap.submitted;
  };

  // Filter applications based on current filter
  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter(app => app.status === filter);

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

  // Get status display text
  const getStatusText = (status) => {
    const statusMap = {
      submitted: 'Submitted',
      processing: 'Processing',
      approved: 'Approved',
      completed: 'Completed',
      rejected: 'Rejected'
    };
    return statusMap[status] || status;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return 'fa-paper-plane';
      case 'processing': return 'fa-sync-alt';
      case 'approved': return 'fa-check-circle';
      case 'completed': return 'fa-check-double';
      case 'rejected': return 'fa-times-circle';
      default: return 'fa-clock';
    }
  };

  // Handle viewing application details
  const handleViewApplication = (appId) => {
    const app = applications.find(a => a._id === appId || a._id.toString() === appId);
    if (app) {
      setSelectedApp(app);
      setProgressSteps(getProgressSteps(app.status));
      setIsModalOpen(true);
    }
  };

  // Track application by reference number
  const handleTrackApplication = async () => {
    if (!referenceNumber.trim()) {
      alert('Please enter an application reference number');
      return;
    }

    // Try finding in local list first
    const localApp = applications.find(a => a._id === referenceNumber || a._id.toString() === referenceNumber);
    if (localApp) {
      handleViewApplication(localApp._id);
      return;
    }

    // If not found locally, fetch via context
    const result = await getApplicationDetails(referenceNumber);
    if (result.success && result.data) {
      // Note: getApplicationDetails stores result in context.selectedApplication 
      // but our handleViewApplication logic uses local state 'selectedApp'.
      // We can just use result.data here.
      const app = result.data;
      setSelectedApp(app);
      setProgressSteps(getProgressSteps(app.status));
      setIsModalOpen(true);
    } else {
      alert('Application not found. Please check the reference number.');
    }
  };

  // Download application certificate
  const handleDownloadCertificate = (appId) => {
    console.log("Redirecting to download page");
    applicationsAPI.downloadCertificate(appId);
  };

  // Download payment receipt
  const handleDownloadReceipt = async (paymentId) => {
    // ... (same as before)
    if (!paymentId) return;
    try {
      const response = await import('../../api/payment.api').then(api => api.downloadReceipt(paymentId));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Failed to download receipt: ${err.message}`);
    }
  };

  // Handle key press for reference number input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTrackApplication();
    }
  };

  // Get service type display name
  const getServiceTypeName = (category, type) => {
    if (category === 'tin') return 'TIN Registration';
    if (category === 'vital') {
      if (type === 'birth') return 'Birth Certificate';
      if (type === 'marriage') return 'Marriage Certificate';
      return 'Vital Certificate';
    }
    return category || 'Application';
  };

  return (
    <AuthGuard>
      <Navigation2></Navigation2>
      <div className="user-application">
        <SideBar1></SideBar1>
        <div className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <h1>Application Status Tracker</h1>
            <p>Track and manage all your government service applications in one place</p>
          </div>

          {/* Error State */}
          {contextError && (
            <div className="error-banner">
              <i className="fas fa-exclamation-circle"></i>
              {contextError}
              <button onClick={fetchApplications} className="retry-btn-small">
                Retry
              </button>
            </div>
          )}

          {/* Track Application Section */}
          <div className="tracker-section">
            <div className="section-header">
              <h2>Track Your Application</h2>
            </div>

            {/* Search Input */}
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your application ID"
              />
              <button className="search-btn" onClick={handleTrackApplication}>
                <i className="fas fa-search"></i> Track Application
              </button>
            </div>

            <p className="search-note">
              <i className="fas fa-info-circle"></i>
              You can enter your application ID or find it in your email confirmation
            </p>
          </div>

          {/* My Applications Section */}
          <div className="tracker-section">
            <div className="section-header">
              <h2>My Applications</h2>
              {!isLoading && (
                <div className="stats">
                  <span>Total: <strong>{applications.length}</strong></span>
                  <span>Processing: <strong>{applications.filter(app => app.status === 'processing').length}</strong></span>
                  <span>Completed: <strong>{applications.filter(app => app.status === 'completed').length}</strong></span>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-folder-open"></i>
                <h3>No Applications Found</h3>
                <p>You haven't submitted any applications yet.</p>
                <p className="empty-state-subtitle">Start by submitting a new application from the dashboard.</p>
              </div>
            ) : (
              <>
                {/* Filters */}
                <div className="filters">
                  {/* ... (Filters markup remains same) ... */}
                  {['all', 'processing', 'approved', 'rejected'].map(status => (
                    <button
                      key={status}
                      className={`filter-btn ${filter === status ? 'active' : ''}`}
                      onClick={() => setFilter(status)}
                    >
                      {status === 'approved' ? 'Completed' : status.charAt(0).toUpperCase() + status.slice(1)} {status === 'all' ? 'Applications' : ''}
                    </button>
                  ))}
                </div>

                {/* Applications Table */}
                {filteredApplications.length === 0 ? (
                  <div className="no-applications">
                    <i className="fas fa-filter"></i>
                    <h3>No applications found</h3>
                    <p>No applications match the current filter.</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="applications-table">
                      <thead>
                        <tr>
                          <th>Application ID</th>
                          <th>Service Type</th>
                          <th>Submission Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.map((app) => (
                          <tr key={app._id}>
                            <td>
                              <div className="app-id">{app._id.toString().substring(0, 12)}...</div>
                            </td>
                            <td>
                              <span className={`service-badge ${app.category || 'default'}`}>
                                {getServiceTypeName(app.category, app.type)}
                              </span>
                            </td>
                            <td className="date-cell">{formatDate(app.createdAt)}</td>
                            <td>
                              <span className={`status-badge ${app.status}`}>
                                <i className={`fas ${getStatusIcon(app.status)}`}></i>
                                {getStatusText(app.status)}
                              </span>
                            </td>
                            <td>
                              <div className="actions-cell">
                                <button
                                  className="action-btn view"
                                  onClick={() => handleViewApplication(app._id)}
                                  title="View Details"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                {['completed', 'approved'].includes(app.status) && (
                                  <button
                                    className="action-btn download"
                                    onClick={() => handleDownloadCertificate(app._id)}
                                    title="Download Certificate"
                                  >
                                    <i className="fas fa-download"></i>
                                  </button>
                                )}
                                {app.formData?.paymentId && (
                                  <button
                                    className="action-btn receipt"
                                    onClick={() => handleDownloadReceipt(app.formData.paymentId)}
                                    title="Download Receipt"
                                  >
                                    <i className="fas fa-file-invoice"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Application Detail Modal */}
          <ApplicationDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            application={selectedApp}
            onDownloadCertificate={handleDownloadCertificate}
            onDownloadReceipt={handleDownloadReceipt}
          />
        </div>
      </div>
      <Footer></Footer>
    </AuthGuard>
  );
};

export default Tracking;
