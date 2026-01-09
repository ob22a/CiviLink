import React, { useState, useEffect } from 'react';
import '../../styles/officer/ApplicationRequests.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import Navigation2 from '../../components/Navigation2';
import OfficerSideBar from '../../components/OfficerSideBar';
import ApplicationDetails from './ApplicationDetails';


function ApplicationRequests() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch applications from API
    useEffect(() => {
        const fetchApplications = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const api = await import('../../api/officer.api');
                const response = await api.getOfficerApplications();

                // Map backend data - use only backend statuses (pending, approved, rejected)
                const mappedApps = (response.data || []).map(app => {
                    // Determine type from category and type
                    let typeLabel = 'TIN Registration';
                    if (app.category === 'VITAL') {
                        if (app.type === 'birth') typeLabel = 'Birth Certificate';
                        else if (app.type === 'marriage') typeLabel = 'Marriage Certificate';
                    }

                    // Get applicant name from formData if available
                    let applicantName = 'N/A';
                    if (app.formData) {
                        if (app.formData.personal?.firstName) {
                            applicantName = `${app.formData.personal.firstName} ${app.formData.personal.lastName || ''}`.trim();
                        } else if (app.formData.birth?.child?.firstName) {
                            applicantName = `${app.formData.birth.child.firstName} ${app.formData.birth.child.lastName || ''}`.trim();
                        } else if (app.formData.marriage?.husband?.applicantInformation?.fullName) {
                            applicantName = app.formData.marriage.husband.applicantInformation.fullName;
                        }
                    }

                    return {
                        id: app._id,
                        type: typeLabel,
                        category: app.category,
                        appType: app.type,
                        applicant: applicantName,
                        submissionDate: new Date(app.createdAt).toISOString().split('T')[0],
                        status: app.status, // Use backend status directly: pending, approved, rejected
                        formData: app.formData,
                        createdAt: app.createdAt,
                        updatedAt: app.updatedAt,
                        lastUpdated: new Date(app.updatedAt).toLocaleString()
                    };
                });

                // Sort: pending first, then closed (approved/rejected) last
                mappedApps.sort((a, b) => {
                    const aIsClosed = a.status === 'approved' || a.status === 'rejected';
                    const bIsClosed = b.status === 'approved' || b.status === 'rejected';
                    if (aIsClosed && !bIsClosed) return 1;
                    if (!aIsClosed && bIsClosed) return -1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                setApplications(mappedApps);
            } catch (err) {
                console.error('Failed to fetch applications:', err);
                setError('Failed to load applications');
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, []);

    // Filters state - removed assignedTo filter
    const [filters, setFilters] = useState({
        status: 'all',
        type: 'all'
    });

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Statistics state - removed inProgress
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0
    });

    // Filter applications based on current filters and search
    const filteredApplications = applications.filter(app => {
        // Search filter
        if (searchQuery && !app.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !app.applicant.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !app.type.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Status filter - only backend statuses
        if (filters.status !== 'all' && app.status !== filters.status) {
            return false;
        }

        // Type filter
        if (filters.type !== 'all' && app.type !== filters.type) {
            return false;
        }

        return true;
    });

    // Update statistics when applications change
    useEffect(() => {
        const total = filteredApplications.length;
        const pending = filteredApplications.filter(app => app.status === 'pending').length;
        const completed = filteredApplications.filter(app => 
            app.status === 'approved' || app.status === 'rejected'
        ).length;

        setStats({ total, pending, completed });
    }, [applications, filters, searchQuery]);

    // Get status configuration - only backend statuses
    const getStatusConfig = (status) => {
        const config = {
            pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-clock' },
            approved: { label: 'Approved', color: '#10b981', bg: '#ecfdf5', icon: 'fa-check-circle' },
            rejected: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2', icon: 'fa-times-circle' }
        };
        return config[status] || { label: status, color: '#6b7280', bg: '#f9fafb', icon: 'fa-question' };
    };

    // Get application type color
    const getTypeColor = (type) => {
        const colors = {
            'Birth Certificate': { bg: '#f0f7ff', color: '#258cf4', icon: 'fa-baby' },
            'Marriage Certificate': { bg: '#fdf2f8', color: '#db2777', icon: 'fa-heart' },
            'TIN Registration': { bg: '#f0fdf4', color: '#16a34a', icon: 'fa-file-invoice-dollar' }
        };
        return colors[type] || { bg: '#f3f4f6', color: '#6b7280', icon: 'fa-file' };
    };

    // Handle filter change
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    // Handle view action
    const handleView = (appId) => {
        setSelectedAppId(appId);
        setIsModalOpen(true);
    };

    // Get unique application types for filter
    const applicationTypes = ['Birth Certificate', 'Marriage Certificate', 'TIN Registration'];

    return (
        <>
            <Navigation2></Navigation2>
            <div className="application-requests">
                <OfficerSideBar></OfficerSideBar>
                <main className='main-content'>
                    <div className="requests-header">
                        <div className="header-left">
                            <h1><i className="fas fa-file-alt"></i> Application Requests</h1>
                            <p className="subtitle">Manage Birth, Marriage, and TIN applications</p>
                        </div>
                        <div className="header-right">
                            <div className="quick-stats">
                                <div className="stat-item">
                                    <div className="stat-value">{stats.total}</div>
                                    <div className="stat-label">Total</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{stats.pending}</div>
                                    <div className="stat-label">Pending</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{stats.completed}</div>
                                    <div className="stat-label">Completed</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="controls-bar">
                        <div className="search-container">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search applications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-buttons">
                            <button
                                className={`filter-btn ${filters.status === 'pending' ? 'active' : ''}`}
                                onClick={() => handleFilterChange('status', filters.status === 'pending' ? 'all' : 'pending')}
                            >
                                <i className="fas fa-clock"></i> Pending
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    <div className="advanced-filters">
                        <div className="filter-group">
                            <label>Application Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Types</option>
                                {applicationTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <button
                            className="clear-filters-btn"
                            onClick={() => setFilters({
                                status: 'all',
                                type: 'all'
                            })}
                        >
                            <i className="fas fa-times"></i> Clear Filters
                        </button>
                    </div>

                    {/* Applications Table */}
                    <div className="applications-table-container">
                        <div className="applications-table">
                            <div className="table-header">
                                <div className="table-cell">Application ID</div>
                                <div className="table-cell type-cell">Type</div>
                                <div className="table-cell">Applicant</div>
                                <div className="table-cell status-cell">Status</div>
                                <div className="table-cell">Submitted</div>
                                <div className="table-cell actions-cell">Actions</div>
                            </div>

                            <div className="table-body">
                                {isLoading ? (
                                    <div className="no-results-row">
                                        <div className="no-results-message">
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <p>Loading applications...</p>
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="no-results-row">
                                        <div className="no-results-message">
                                            <i className="fas fa-exclamation-circle"></i>
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                ) : filteredApplications.length === 0 ? (
                                    <div className="no-results-row">
                                        <div className="no-results-message">
                                            <i className="fas fa-search"></i>
                                            <p>No applications found. Try adjusting your filters.</p>
                                        </div>
                                    </div>
                                ) : (
                                    filteredApplications.map((app) => {
                                        const statusConfig = getStatusConfig(app.status);
                                        const typeConfig = getTypeColor(app.type);

                                        return (
                                            <div key={app.id} className="table-row">
                                                <div className="table-cell">
                                                    <div className="app-id-cell">
                                                        <strong>{app.id}</strong>
                                                    </div>
                                                </div>
                                                <div className="table-cell type-cell">
                                                    <div
                                                        className="app-type-badge"
                                                        style={{
                                                            backgroundColor: typeConfig.bg,
                                                            color: typeConfig.color
                                                        }}
                                                    >
                                                        <i className={`fas ${typeConfig.icon}`}></i>
                                                        <span className="type-short">
                                                            {app.type === 'Birth Certificate' ? 'Birth' :
                                                                app.type === 'Marriage Certificate' ? 'Marriage' : 'TIN'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="table-cell">
                                                    <div className="applicant-info">
                                                        <div className="applicant-name">{app.applicant}</div>
                                                    </div>
                                                </div>
                                                <div className="table-cell status-cell">
                                                    <span
                                                        className="status-badge"
                                                        style={{
                                                            color: statusConfig.color,
                                                            backgroundColor: statusConfig.bg
                                                        }}
                                                    >
                                                        <i className={`fas ${statusConfig.icon}`}></i>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <div className="table-cell">
                                                    {app.submissionDate}
                                                </div>
                                                <div className="table-cell actions-cell">
                                                    <div className="action-buttons">
                                                        <button
                                                            className="action-btn view"
                                                            onClick={() => handleView(app.id)}
                                                            title="View Details"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="summary-stats">
                        <div className="summary-card">
                            <div className="summary-icon birth">
                                <i className="fas fa-baby"></i>
                            </div>
                            <div className="summary-content">
                                <h4>Birth Certificates</h4>
                                <div className="summary-count">
                                    {applications.filter(app => app.type === 'Birth Certificate').length} applications
                                </div>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="summary-icon marriage">
                                <i className="fas fa-heart"></i>
                            </div>
                            <div className="summary-content">
                                <h4>Marriage Certificates</h4>
                                <div className="summary-count">
                                    {applications.filter(app => app.type === 'Marriage Certificate').length} applications
                                </div>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="summary-icon tin">
                                <i className="fas fa-file-invoice-dollar"></i>
                            </div>
                            <div className="summary-content">
                                <h4>TIN Registrations</h4>
                                <div className="summary-count">
                                    {applications.filter(app => app.type === 'TIN Registration').length} applications
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {isModalOpen && (
                <ApplicationDetails
                    id={selectedAppId}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedAppId(null);
                    }}
                    onRefresh={() => {
                        // Refresh applications list
                        window.location.reload();
                    }}
                />
            )}
            <Footer></Footer>
        </>
    );
}

export default ApplicationRequests;
