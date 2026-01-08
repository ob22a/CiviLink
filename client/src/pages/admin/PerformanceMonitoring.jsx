import React, { useState, useEffect, useMemo } from 'react';
import '../../styles/admin/PerformanceMonitoring.css';
import Navigation2 from '../../components/Navigation2';
import AdminSideBar from '../../components/AdminSideBar';
import Footer from '../../components/Footer';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function PerformanceMonitoringContent() {
  const { fetchPerformanceData, exportPerformanceReport, loading, error } = useAdmin();
  const [data, setData] = useState({
    metrics: null,
    officers: null
  });

  // State for filters
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedMetric, setSelectedMetric] = useState('requests');
  const [selectedSubcity, setSelectedSubcity] = useState('all');
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    try {
      const params = { page, limit: 10 };
      if (selectedDepartment !== 'all') params.department = selectedDepartment;
      if (selectedSubcity !== 'all') params.subcity = selectedSubcity;
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      const result = await fetchPerformanceData(params);
      setData(result);
    } catch (err) {
      console.error("Performance data load failed", err);
    }
  }, [fetchPerformanceData, selectedDepartment, selectedSubcity, dateRange, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData();
  };

  const metricsData = data.metrics?.data;
  const officerResults = data.officers?.data;
  const officers = officerResults?.docs || [];
  const metricsSummary = metricsData?.summary;

  const handleExport = async () => {
    try {
      const params = {};
      if (selectedDepartment !== 'all') params.department = selectedDepartment;
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      const blob = await exportPerformanceReport(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export report");
    }
  };

  const departments = [
    { id: 'approver', name: 'Approver' },
    { id: 'customer_support', name: 'Customer Support' }
  ];

  const topPerformers = useMemo(() => {
    // strict schema says metrics has topPerformers, use that if available, else derive
    if (metricsData?.topPerformers) return metricsData.topPerformers.slice(0, 5);
    if (!officers) return [];
    return [...officers].sort((a, b) => (b.requestsProcessed || 0) - (a.requestsProcessed || 0)).slice(0, 5);
  }, [metricsData, officers]);

  // Derived Metrics
  const topDepartment = (metricsData?.topPerformers && metricsData.topPerformers.length > 0)
    ? metricsData.topPerformers[0].department
    : 'N/A';

  if (loading && !metricsData) {
    return (
      <>
        <Navigation2 />
        <div className="performance-monitoring">
          <AdminSideBar />
          <main className="main-content">
            <LoadingSpinner message="Loading Performance Data..." />
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
        <div className="performance-monitoring">
          <AdminSideBar />
          <main className="main-content">
            <div className="error-message">Error loading performance data: {error}</div>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation2></Navigation2>
      <div className="performance-monitoring">
        <AdminSideBar></AdminSideBar>
        <main className="main-content">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1>Performance Monitoring</h1>
              <p>Track and analyze officer performance metrics</p>
            </div>
            <div className="header-actions">
              <button className="btn-outline" onClick={handleRefresh} disabled={loading}>
                <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <div className="export-dropdown">
                <button className="btn-primary" onClick={handleExport} disabled={loading}>
                  <i className="fas fa-download"></i>
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="filter-controls">
              <div className="filter-group">
                <label>Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Subcity</label>
                <select
                  value={selectedSubcity}
                  onChange={(e) => setSelectedSubcity(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Subcities</option>
                  {['Kolfe Keranio', 'Nefas Silk Lafto', 'Yeka'].map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>From</label>
                <input
                  type="date"
                  className="filter-input"
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', height: '38px', minWidth: '150px' }}
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>

              <div className="filter-group">
                <label>To</label>
                <input
                  type="date"
                  className="filter-input"
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', height: '38px', minWidth: '150px' }}
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>


            </div>
          </div>

          {/* Performance Overview Cards */}
          <div className="performance-overview">
            <div className="overview-card">
              <div className="card-header">
                <div className="card-icon">
                  <i className="fas fa-tasks"></i>
                </div>
                <div>
                  <h3>{(metricsSummary?.totalRequestsProcessed || 0).toLocaleString()}</h3>
                  <p>Total Requests</p>
                </div>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-header">
                <div className="card-icon" style={{ background: '#fff3e0' }}>
                  <i className="fas fa-clock" style={{ color: '#f57c00' }}></i>
                </div>
                <div>
                  <h3>{metricsSummary?.averageResponseTimeMs ? `${(metricsSummary.averageResponseTimeMs / 3600000).toFixed(1)}h` : 'N/A'}</h3>
                  <p>Avg. Response Time</p>
                </div>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-header">
                <div className="card-icon" style={{ background: '#e8f5e9' }}>
                  <i className="fas fa-chart-line" style={{ color: '#388e3c' }}></i>
                </div>
                <div>
                  <h3>{metricsSummary?.communicationResponseRate !== undefined ? `${(metricsSummary.communicationResponseRate <= 1 ? metricsSummary.communicationResponseRate * 100 : metricsSummary.communicationResponseRate).toFixed(2)}%` : 'N/A'}</h3>
                  <p>Response Rate</p>
                </div>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-header">
                <div className="card-icon" style={{ background: '#f3e5f5' }}>
                  <i className="fas fa-users" style={{ color: '#7b1fa2' }}></i>
                </div>
                <div>
                  <h3>{officerResults?.totalDocs || 0}</h3>
                  <p>Total Officers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Metrics Grid */}
          <div className="metrics-grid">

            {/* Performance Trends Chart */}
            <div className="metric-card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Performance Trends</h3>
                <div className="metric-toggle" style={{ display: 'flex', gap: '5px' }}>
                  <button
                    className={`btn-xs ${selectedMetric === 'requests' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
                    onClick={() => setSelectedMetric('requests')}
                  >
                    Requests
                  </button>
                  <button
                    className={`btn-xs ${selectedMetric === 'time' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
                    onClick={() => setSelectedMetric('time')}
                  >
                    Time
                  </button>
                  <button
                    className={`btn-xs ${selectedMetric === 'rate' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
                    onClick={() => setSelectedMetric('rate')}
                  >
                    Rate
                  </button>
                </div>
              </div>
              <div className="chart-area" style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '20px 0' }}>
                {metricsData?.monthlyTrend && metricsData.monthlyTrend.length > 0 ? (() => {
                  const data = metricsData.monthlyTrend.map(item => {
                    let value = 0;
                    if (selectedMetric === 'requests') value = item.requestsProcessed;
                    else if (selectedMetric === 'time') value = Number((item.averageResponseTimeMs / 3600000).toFixed(1));
                    else if (selectedMetric === 'rate') value = Number((((item.communicationResponseRate || 0) + (item.applicationResponseRate || 0)) / 2 * 100).toFixed(2));
                    return { label: item.month, value };
                  });
                  const maxVal = Math.max(...data.map(d => d.value)) * 1.1 || 10;
                  return data.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                        <div style={{
                          width: '100%',
                          height: `${(d.value / maxVal) * 100}%`,
                          backgroundColor: selectedMetric === 'requests' ? '#3b82f6' : selectedMetric === 'time' ? '#f59e0b' : '#10b981',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease',
                          position: 'relative',
                          minHeight: '4px'
                        }} title={`${d.value}${selectedMetric === 'rate' ? '%' : ''}`}>
                          <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#666', whiteSpace: 'nowrap' }}>{d.value}{selectedMetric === 'rate' ? '%' : ''}</span>
                        </div>
                      </div>
                      <span style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>{d.label}</span>
                    </div>
                  ));
                })() : <p className="p-4 text-gray-500 w-full text-center">No trend data available.</p>}
              </div>
            </div>

            {/* Top Performers */}
            <div className="metric-card">
              <div className="card-header">
                <h3>Top Performers</h3>
              </div>
              <div className="top-performers">
                {topPerformers.length > 0 ? topPerformers.map((officer, index) => (
                  <div key={officer.id || index} className="performer-item">
                    <div className="performer-rank">
                      <span className={`rank-badge rank-${index + 1}`}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="performer-info">
                      <div className="performer-name">{officer.fullName || officer.name || 'Unknown'}</div>
                      <div className="performer-department">{officer.department}</div>
                    </div>
                    <div className="performer-stats">
                      <div className="performer-requests">
                        <i className="fas fa-tasks"></i>
                        <span>{officer.requestsProcessed}</span>
                      </div>
                    </div>
                  </div>
                )) : <p className="p-4 text-gray-500">No officer data available.</p>}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="metric-card">
              <div className="card-header">
                <h3>Key Metrics</h3>
              </div>
              <div className="key-metrics">
                <div className="key-metric">
                  <div className="metric-icon">
                    <i className="fas fa-chart-area"></i>
                  </div>
                  <div className="metric-info">
                    <h4>{metricsSummary?.averageResponseTimeMs ? `${(metricsSummary.averageResponseTimeMs / 3600000).toFixed(1)}h` : 'N/A'}</h4>
                    <p>Avg. Processing Time</p>
                  </div>
                </div>
                <div className="key-metric">
                  <div className="metric-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="metric-info">
                    <h4>{metricsSummary?.communicationResponseRate !== undefined ? `${(metricsSummary.communicationResponseRate <= 1 ? metricsSummary.communicationResponseRate * 100 : metricsSummary.communicationResponseRate).toFixed(2)}%` : 'N/A'}</h4>
                    <p>Response Rate</p>
                  </div>
                </div>
                <div className="key-metric">
                  <div className="metric-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="metric-info">
                    <h4>{officerResults?.totalDocs || 0}</h4>
                    <p>Total Officers</p>
                  </div>
                </div>
                <div className="key-metric">
                  <div className="metric-icon">
                    <i className="fas fa-building"></i>
                  </div>
                  <div className="metric-info">
                    <h4>{topDepartment}</h4>
                    <p>Top Department</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Details Table */}
          <div className="performance-table-section">
            <div className="section-header">
              <h3>Detailed Officer Performance</h3>
            </div>
            <div className="table-container">
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Officer</th>
                    <th>Department</th>
                    <th>Requests</th>
                    <th>Avg. Time</th>
                    <th>Response Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {officers && officers.length > 0 ? officers.map((officer, index) => (
                    <tr key={officer.officerId || officer._id || index}>
                      <td>
                        <div className="officer-cell">
                          <div className="officer-avatar">
                            {(officer.name || 'U').charAt(0)}
                          </div>
                          <div className="officer-info">
                            <div className="officer-name">{officer.name}</div>
                            <div className="officer-id">ID: {(officer.officerId || '').substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="department-tag">{officer.department}</span>
                      </td>
                      <td>
                        <div className="metric-cell">
                          <span className="metric-value">{officer.requestsProcessed}</span>
                        </div>
                      </td>
                      <td>
                        <div className="time-cell">
                          <i className="fas fa-clock"></i>
                          <span>{officer.avgResponseTime ? `${(officer.avgResponseTime / 3600000).toFixed(1)}h` : 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="rate-badge medium">
                          {officer.responseRate !== undefined ? `${(officer.responseRate <= 1 ? officer.responseRate * 100 : officer.responseRate).toFixed(2)}%` : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No officer data found</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '20px 0', alignItems: 'center' }}>
                <button
                  className="btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                  disabled={!officerResults?.hasPrevPage}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                >
                  <i className="fas fa-chevron-left" style={{ marginRight: '5px' }}></i> Previous
                </button>
                <span style={{ fontWeight: '500', color: '#666' }}>
                  Page {officerResults?.page || 1} of {officerResults?.totalPages || 1}
                </span>
                <button
                  className="btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                  disabled={!officerResults?.hasNextPage}
                  onClick={() => setPage(prev => prev + 1)}
                >
                  Next <i className="fas fa-chevron-right" style={{ marginLeft: '5px' }}></i>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer></Footer>
    </>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("PerformanceMonitoring Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl text-red-600 mb-4">Something went wrong loading performance metrics.</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PerformanceMonitoring() {
  return (
    <ErrorBoundary>
      <PerformanceMonitoringContent />
    </ErrorBoundary>
  );
}