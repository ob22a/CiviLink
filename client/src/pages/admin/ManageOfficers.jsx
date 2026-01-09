import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../../styles/admin/ManageOfficers.css';
import Navigation2 from '../../components/Navigation2.jsx';
import Footer from '../../components/Footer.jsx';
import AdminSideBar from '../../components/AdminSideBar.jsx';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDuration } from '../../utils/formatters';

function ManageOfficers() {
  const { fetchOfficerList, promoteUser, searchUser, loading, error } = useAdmin();

  // URL Params
  const [searchParams, setSearchParams] = useSearchParams();

  const departments = [
    { id: 'approver', name: 'Approver' },
    { id: 'customer_support', name: 'Customer Support' }
  ];

  // State
  const [officers, setOfficers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [counts, setCounts] = useState({ total: 0, active: 0, onLeave: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters State (init from URL)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    department: searchParams.get('department') || 'all',
    subcity: searchParams.get('subcity') || 'all',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || ''
  });

  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);

  // Debounce Search
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters.search]);

  // Sync URL with state
  // Sync URL with state (Filters only, not Page/Limit as per request)
  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.department !== 'all') params.department = filters.department;
    if (filters.subcity !== 'all') params.subcity = filters.subcity;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const loadOfficers = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        from: filters.from,
        to: filters.to,
        department: filters.department !== 'all' ? filters.department : undefined,
        subcity: filters.subcity !== 'all' ? filters.subcity : undefined,
        search: debouncedSearch || undefined
      };

      const response = await fetchOfficerList(params);

      // response is { docs, totalDocs, limit, page, totalPages, hasNextPage, hasPrevPage, counts }
      if (response && response.docs) {
        setOfficers(response.docs);
        setPagination(prev => ({
          ...prev,
          page: response.page,
          totalDocs: response.totalDocs,
          totalPages: response.totalPages,
          hasNextPage: response.hasNextPage,
          hasPrevPage: response.hasPrevPage
        }));
        if (response.counts) {
          setCounts(response.counts);
        }
      } else {
        setOfficers([]);
      }
    } catch (err) {
      console.error("Failed to load officers", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOfficers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.department, filters.subcity, filters.from, filters.to, debouncedSearch, fetchOfficerList]);
  // Trigger load on filter/page change. Debounced search would trigger name search if implemented.

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  // Stats from backend counts
  const stats = {
    total: counts.total || 0,
    active: counts.active || 0,
    inactive: counts.onLeave || 0, // Mapping 'onLeave' to 'inactive' card for now, or create new card? User said "how many officers are on leave".
    // Existing UI has "Active" card.
    // Let's use 'active' from backend.
    // And maybe show 'On Leave' explicitly?
    // The current UI Cards are: Total, Active.
    // I will update the second card to 'Active' w/ count. 
    // Maybe add a new card for 'On Leave' if space permits? 
    // "In the dashboard and officer report page total officers is equal to the number of officers available... get how many officers are on leave"
    // I will stick to the existing cards but correct the data.
  };


  const handleSaveOfficer = async (officerData) => {
    try {
      await promoteUser(officerData);
      // Refresh list after success
      const refreshedList = await fetchOfficerList();
      setOfficers(Array.isArray(refreshedList) ? refreshedList : []);
      setShowAddOfficerModal(false);
      alert("Officer promoted successfully!");
    } catch (err) {
      console.error("Failed to promote officer", err);
      alert("Failed to promote officer: " + err.message);
    }
  };

  if (isLoading && officers.length === 0) {
    return (
      <>
        <Navigation2 />
        <div className="manage-officers">
          <AdminSideBar />
          <main className="main-content">
            <LoadingSpinner message="Loading Officers..." />
          </main>
        </div>
        <Footer />
      </>
    );
  }

  // Error state handled gracefully within UI below or with empty state

  return (
    <>
      <Navigation2></Navigation2>
      <div className="manage-officers">
        <AdminSideBar></AdminSideBar>
        <main className="main-content">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1>Manage Officers</h1>
              <p>View, add, and manage officer accounts</p>
            </div>
            <div className="header-actions">
              <button
                className="btn-primary"
                onClick={() => setShowAddOfficerModal(true)}
              >
                <i className="fas fa-plus"></i>
                Add New Officer
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>Total Officers</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e8f5e9' }}>
                <i className="fas fa-check-circle" style={{ color: '#388e3c' }}></i>
              </div>
              <div className="stat-info">
                <h3>{stats.active}</h3>
                <p>Active</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fff3e0' }}>
                <i className="fas fa-user-clock" style={{ color: '#f57c00' }}></i>
              </div>
              <div className="stat-info">
                <h3>{stats.inactive}</h3>
                <p>On Leave / Inactive</p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="filters-section">
            <h3 className="filters-title">Filter Officers</h3>
            <div className="filters-layout">
              {/* Top Row: Search */}
              <div className="filter-row-top">
                <div className="filter-group search-group">
                  <label>Search</label>
                  <div className="search-input-wrapper">
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Middle Row: Drops and Dates */}
              <div className="filter-row-middle">
                <div className="filter-group">
                  <label>Department</label>
                  <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Subcity</label>
                  <select
                    value={filters.subcity}
                    onChange={(e) => handleFilterChange('subcity', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Subcities</option>
                    {['Arada', 'Bole', 'Addis Ketema', 'Nefas Silk Lafto', 'Yeka', 'Kirkos', 'Gullele', 'Lideta', 'Akaki Kality', 'Kolfe Keranio'].map(sc => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>

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
              </div>

              {/* Bottom Row: Actions */}
              <div className="filter-row-bottom">
                <button className="btn-secondary" onClick={() => {
                  setFilters({ search: '', department: 'all', subcity: 'all', from: '', to: '' });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}>
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Officers Table */}
          <div className="table-container">
            <table className="officers-table">
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Department</th>
                  <th>Subcity</th>
                  <th>Role</th>
                  <th>Avg Response</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {officers.length > 0 ? officers.map((officer, index) => (
                  <tr key={officer.officerId || index}>
                    <td>
                      <div className="officer-info">
                        <div className="officer-avatar">
                          {(officer.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="officer-name">{officer.name}</div>
                          <div className="officer-email">{officer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="department-badge">
                        {officer.department}
                      </span>
                    </td>
                    <td>{officer.subcity || 'N/A'}</td>
                    <td>{officer.role || 'Officer'}</td>
                    <td>{officer.avgResponseTime ? formatDuration(officer.avgResponseTime) : 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          disabled
                          title="Edit not supported yet"
                          style={{ opacity: 0.5, cursor: 'not-allowed' }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="action-btn delete"
                          disabled
                          title="Delete not supported yet"
                          style={{ opacity: 0.5, cursor: 'not-allowed', marginLeft: '8px' }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <i className="fas fa-search" style={{ fontSize: '2rem', color: '#cbd5e0' }}></i>
                        <p>No officers found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pagination-controls">
              <div className="pagination-info">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalDocs)} of {pagination.totalDocs} entries
              </div>
              <div className="pagination-buttons">
                <button
                  className="btn-outline"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
                <div className="page-numbers">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && <span className="ellipsis">...</span>}
                        <button
                          className={`page-btn ${p === pagination.page ? 'active' : ''}`}
                          onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                </div>
                <button
                  className="btn-outline"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* Add Officer Modal */}
          {showAddOfficerModal && (
            <PromoteOfficerModal
              departments={departments}
              onClose={() => setShowAddOfficerModal(false)}
              onSave={handleSaveOfficer}
              searchUser={searchUser}
            />
          )}
        </main>
      </div>
      <Footer></Footer>
    </>
  );
}

// Officer Modal Component
function PromoteOfficerModal({ departments, onClose, onSave, searchUser }) {
  const [step, setStep] = useState(1); // 1: Search, 2: Details
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    department: departments[0]?.id || 'approver', // Use ID
    subcity: 'Arada', // Default
    adminPassword: ''
  });

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2 && !formData.userId) {
        setIsSearching(true);
        try {
          const results = await searchUser({ name: searchTerm });
          // searchUser returns { success: true, count: N, citizens: [] }
          if (results && results.citizens) {
            setSearchResults(results.citizens);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, formData.userId, searchUser]);

  const handleSelectUser = (user) => {
    setFormData(prev => ({
      ...prev,
      userId: user._id,
      name: user.fullName,
      email: user.email
    }));
    setSearchTerm(user.fullName);
    setSearchResults([]);
  };

  const handleClearSelection = () => {
    setFormData(prev => ({
      ...prev,
      userId: '',
      name: '',
      email: ''
    }));
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.userId) {
      alert("Please select a user to promote.");
      return;
    }
    if (!formData.adminPassword) {
      alert("Admin password is required.");
      return;
    }

    // Payload for API
    onSave({
      userId: formData.userId,
      department: formData.department,
      subcity: formData.subcity,
      adminPassword: formData.adminPassword
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Promote to Officer</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* Step 1: User Search */}
            <div className="form-section">
              <h3>1. Select Citizen</h3>
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Search Citizen (Name or Email) *</label>
                <div className="search-input-wrapper">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (formData.userId) handleClearSelection(); // Clear if editing selected name
                    }}
                    placeholder="Type to search..."
                    disabled={!!formData.userId}
                    style={{ paddingRight: formData.userId ? '2.5rem' : '1rem' }}
                  />
                  {formData.userId && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>

                {/* Dropdown Results */}
                {searchResults.length > 0 && !formData.userId && (
                  <div className="search-results-dropdown">
                    {searchResults.map(user => (
                      <div
                        key={user._id}
                        className="search-result-item"
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="user-name">{user.fullName}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    ))}
                  </div>
                )}
                {isSearching && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Searching...</div>}
              </div>

              {formData.userId && (
                <div className="selected-user-summary" style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                  <div style={{ fontWeight: '600', color: '#0284c7' }}>Selected User:</div>
                  <div>{formData.name} ({formData.email})</div>
                </div>
              )}
            </div>

            {/* Step 2: Assignment Details */}
            <div className="form-section">
              <h3>2. Assignment Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subcity *</label>
                  <select
                    value={formData.subcity}
                    onChange={(e) => setFormData({ ...formData, subcity: e.target.value })}
                    required
                  >
                    {['Arada', 'Bole', 'Addis Ketema', 'Nefas Silk Lafto', 'Yeka', 'Kirkos', 'Gullele', 'Lideta', 'Akaki Kality', 'Kolfe Keranio'].map(sc => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Admin Verification */}
            <div className="form-section">
              <h3>3. Security Verification</h3>
              <div className="form-group">
                <label>Admin Password *</label>
                <input
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  required
                  placeholder="Enter your admin password to confirm"
                />
                <small style={{ color: '#64748b', marginTop: '0.25rem' }}>
                  This action grants official officer privileges.
                </small>
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!formData.userId || !formData.adminPassword}
            >
              Confirm Promotion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManageOfficers;