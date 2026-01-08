import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../../styles/admin/SecurityReport.css';
import AdminSideBar from '../../components/AdminSideBar';
import Footer from '../../components/Footer';
import Navigation2 from '../../components/Navigation2';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function SecurityReport() {
  const { fetchSecurityLogs, exportSecurityLogs, loading, error } = useAdmin();

  // State
  const [logs, setLogs] = useState([]);
  const [metadata, setMetadata] = useState({ totalDocs: 0, totalPages: 1, page: 1, hasNextPage: false, hasPrevPage: false });
  const [page, setPage] = useState(1);
  const [showThreatDetails, setShowThreatDetails] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    officerName: '',
    attemptCountMin: '',
    attemptType: 'all',
    failedOnly: false,
    afterHoursOnly: false
  });

  // Debounce Officer Name
  const [debouncedOfficerName, setDebouncedOfficerName] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedOfficerName(filters.officerName);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters.officerName]);

  // Load Logs
  const loadLogs = useCallback(async () => {
    try {
      const params = { page, limit: 10 };

      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (debouncedOfficerName) params.officerName = debouncedOfficerName;
      if (filters.attemptCountMin) params.attemptCountMin = filters.attemptCountMin;
      if (filters.attemptType !== 'all') params.attemptType = filters.attemptType;
      if (filters.failedOnly) params.failedOnly = 'true';
      if (filters.afterHoursOnly) params.afterHoursOnly = 'true';

      const response = await fetchSecurityLogs(params);
      if (response && response.reports) {
        setLogs(response.reports);
        setMetadata({
          totalDocs: response.totalDocs || 0,
          totalPages: response.totalPages || 1,
          page: response.page || 1,
          hasNextPage: response.hasNextPage,
          hasPrevPage: response.hasPrevPage
        });
      }
    } catch (err) {
      console.error("Failed to fetch security logs", err);
    }
  }, [fetchSecurityLogs, page, filters.from, filters.to, debouncedOfficerName, filters.attemptCountMin, filters.attemptType, filters.failedOnly, filters.afterHoursOnly]);

  useEffect(() => {
    loadLogs();
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadLogs, 30000);
    }
    return () => clearInterval(interval);
  }, [loadLogs, autoRefresh]);

  // Stats Logic (Derived)
  const stats = useMemo(() => {
    const high = logs.filter(l => ['UNAUTHORIZED_ACCESS', 'LOGIN_FAILURE', 'LOGIN_FAILED'].includes(l.attemptType)).reduce((acc, curr) => acc + (curr.count || 1), 0);
    const method = logs.filter(l => ['TOKEN_EXPIRED'].includes(l.attemptType)).reduce((acc, curr) => acc + (curr.count || 1), 0);
    const low = logs.filter(l => ['LOGIN_SUCCESS'].includes(l.attemptType)).reduce((acc, curr) => acc + (curr.count || 1), 0);

    return {
      total: logs.reduce((acc, curr) => acc + (curr.count || 1), 0),
      high,
      medium: method,
      low
    };
  }, [logs]);

  const getAttemptTypeBadge = (type) => {
    let color = { bg: '#e5edff', text: '#3b82f6', icon: 'fa-info-circle' };
    if (['LOGIN_FAILURE', 'UNAUTHORIZED_ACCESS', 'LOGIN_FAILED'].includes(type)) {
      color = { bg: '#fee2e2', text: '#dc2626', icon: 'fa-times-circle' };
    } else if (type === 'TOKEN_EXPIRED') {
      color = { bg: '#fef3c7', text: '#d97706', icon: 'fa-exclamation-triangle' };
    } else if (type === 'LOGIN_SUCCESS') {
      color = { bg: '#d1fae5', text: '#059669', icon: 'fa-check-circle' };
    }
    return (
      <span className="severity-badge" style={{ background: color.bg, color: color.text }}>
        <i className={`fas ${color.icon}`}></i>
        {type ? type.replace(/_/g, ' ') : 'Unknown'}
      </span>
    );
  };

  const handleExportReport = async () => {
    try {
      const params = { format: 'json' };
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (debouncedOfficerName) params.officerName = debouncedOfficerName;
      if (filters.attemptCountMin) params.attemptCountMin = filters.attemptCountMin;
      if (filters.attemptType !== 'all') params.attemptType = filters.attemptType;
      if (filters.failedOnly) params.failedOnly = 'true';
      if (filters.afterHoursOnly) params.afterHoursOnly = 'true';

      const result = await exportSecurityLogs(params);

      if (result.success && result.type === 'base64') {
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/json' });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename || 'security_logs.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export logs");
    }
  };

  // Filter Handler
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 on filter change
  };

  if (loading && logs.length === 0) {
    return (
      <>
        <Navigation2 />
        <div className="security-report">
          <AdminSideBar />
          <main className="main-content">
            <LoadingSpinner message="Loading Security Logs..." />
          </main>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation2 />
      <div className="security-report">
        <AdminSideBar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1>Security Logs</h1>
              <p>Monitor system access and security events</p>
            </div>
            <div className="header-actions">
              <button
                className="btn-outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <i className={`fas fa-sync-alt ${autoRefresh ? 'spinning' : ''}`}></i>
                {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
              </button>
              <div className="export-dropdown">
                <button className="btn-outline" onClick={handleExportReport} disabled={loading}>
                  <i className="fas fa-download"></i>
                  Export JSON
                </button>
              </div>
            </div>
          </div>

          <div className="security-overview">
            <div className="overview-card critical">
              <div className="card-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="card-content">
                <h3>{stats.high}</h3>
                <p>High Severity</p>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="card-content">
                <h3>{stats.medium}</h3>
                <p>Warnings</p>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="card-content">
                <h3>{stats.low}</h3>
                <p>Successful Logins</p>
              </div>
            </div>
          </div>

          <div className="filters-section">
            <h3 className="filters-title">Advanced Filters</h3>
            <div className="filters-layout">

              <div className="filter-row-top">
                <div className="filter-group search-group">
                  <label>Officer Name</label>
                  <div className="search-input-wrapper">
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      placeholder="Search by officer name..."
                      value={filters.officerName}
                      onChange={(e) => handleFilterChange('officerName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-group type-group">
                  <label>Attempt Type</label>
                  <select
                    value={filters.attemptType}
                    onChange={(e) => handleFilterChange('attemptType', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Types</option>
                    <option value="LOGIN_SUCCESS">Login Success</option>
                    <option value="LOGIN_FAILURE">Login Failure</option>
                    <option value="UNAUTHORIZED_ACCESS">Unauthorized Access</option>
                    <option value="TOKEN_EXPIRED">Token Expired</option>
                  </select>
                </div>
              </div>

              <div className="filter-row-middle">
                <div className="filter-group">
                  <label>Date From</label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) => handleFilterChange('from', e.target.value)}
                    className="filter-input"
                  />
                </div>

                <div className="filter-group">
                  <label>Date To</label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) => handleFilterChange('to', e.target.value)}
                    className="filter-input"
                  />
                </div>

                <div className="filter-group">
                  <label>Min Attempts</label>
                  <input
                    type="number"
                    placeholder="Min count"
                    value={filters.attemptCountMin}
                    onChange={(e) => handleFilterChange('attemptCountMin', e.target.value)}
                    className="filter-input"
                    min="0"
                  />
                </div>
              </div>

              <div className="filter-row-bottom">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.failedOnly}
                    onChange={(e) => handleFilterChange('failedOnly', e.target.checked)}
                  />
                  <span className="checkbox-text">Failed Attempts Only</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.afterHoursOnly}
                    onChange={(e) => handleFilterChange('afterHoursOnly', e.target.checked)}
                  />
                  <span className="checkbox-text">After Hours Only</span>
                </label>
              </div>

            </div>
          </div>

          <div className="security-grid">
            <div className="security-card large" style={{ width: '100%' }}>
              <div className="card-header">
                <h3>Security Logs</h3>
                <div className="card-actions">
                  <span className="threat-count">{metadata.totalDocs} events found</span>
                </div>
              </div>
              <div className="table-container">
                <table className="threats-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Attempt Type</th>
                      <th>Officer</th>
                      <th>Count</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? logs.map((log, index) => (
                      <tr key={index}>
                        <td>
                          <div className="timestamp">
                            {new Date(log.timeOfAttempt).toLocaleString()}
                          </div>
                        </td>
                        <td>
                          {getAttemptTypeBadge(log.attemptType)}
                        </td>
                        <td>
                          <div className="source-info">
                            <span className="source-ip">{log.officerName || 'Unknown'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="source-info">
                            <span className="source-ip column-center">{log.count || 1}</span>
                          </div>
                        </td>
                        <td>
                          <div className="threat-actions">
                            <button
                              className="action-btn view"
                              onClick={() => setShowThreatDetails(log)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No logs found matching criteria.</td></tr>
                    )}
                  </tbody>
                </table>
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '20px 0', alignItems: 'center' }}>
                  <button
                    className="btn-outline"
                    style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                    disabled={!metadata.hasPrevPage}
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  >
                    <i className="fas fa-chevron-left" style={{ marginRight: '5px' }}></i> Previous
                  </button>
                  <span style={{ fontWeight: '500', color: '#666' }}>
                    Page {metadata.page} of {metadata.totalPages}
                  </span>
                  <button
                    className="btn-outline"
                    style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                    disabled={!metadata.hasNextPage}
                    onClick={() => setPage(prev => prev + 1)}
                  >
                    Next <i className="fas fa-chevron-right" style={{ marginLeft: '5px' }}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showThreatDetails && (
            <ThreatDetailsModal
              log={showThreatDetails}
              onClose={() => setShowThreatDetails(null)}
              getAttemptTypeBadge={getAttemptTypeBadge}
            />
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

function ThreatDetailsModal({ log, onClose, getAttemptTypeBadge }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content threat-modal">
        <div className="modal-header">
          <div className="modal-title">
            <h2>Log Details</h2>
            <div className="threat-severity">
              {getAttemptTypeBadge(log.attemptType)}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="threat-details-grid">
            <div className="detail-item">
              <label>Timestamp</label>
              <div className="detail-value">{new Date(log.timeOfAttempt).toLocaleString()}</div>
            </div>
            <div className="detail-item">
              <label>Count</label>
              <div className="detail-value">{log.count || 1}</div>
            </div>
            <div className="detail-item" style={{ gridColumn: 'span 2' }}>
              <label>Officer</label>
              <div className="detail-value">{log.officerName}</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SecurityReport;