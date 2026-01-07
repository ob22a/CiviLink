import React, { useState, useEffect } from 'react';
import '../../styles/officer/ApplicationDetails.css';

function ApplicationDetails({ id, onClose, onRefresh }) {
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    // Get status configuration - only backend statuses
    const getStatusConfig = (status) => {
        const config = {
            pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-clock' },
            approved: { label: 'Approved', color: '#10b981', bg: '#ecfdf5', icon: 'fa-check-circle' },
            rejected: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2', icon: 'fa-times-circle' }
        };
        return config[status] || { label: status, color: '#6b7280', bg: '#f9fafb', icon: 'fa-question' };
    };

    useEffect(() => {
        const loadApplication = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            try {
                const api = await import('../../api/officer.api');
                const response = await api.getApplicationDetails(id);

                if (response.success) {
                    const rawData = response.data;

                    // Determine type label
                    let typeLabel = 'TIN Registration';
                    if (rawData.category === 'VITAL') {
                        if (rawData.type === 'birth') typeLabel = 'Birth Certificate';
                        else if (rawData.type === 'marriage') typeLabel = 'Marriage Certificate';
                    }

                    setApplication({
                        id: rawData._id,
                        category: rawData.category,
                        type: rawData.type,
                        typeLabel: typeLabel,
                        status: rawData.status, // Use backend status directly
                        formData: rawData.formData || {},
                        rejectionReason: rawData.rejectionReason,
                        createdAt: rawData.createdAt,
                        updatedAt: rawData.updatedAt
                    });
                } else {
                    setError('Failed to load application');
                }
            } catch (err) {
                console.error('Failed to load application:', err);
                setError(err.message || 'Failed to load application');
            } finally {
                setLoading(false);
            }
        };

        loadApplication();
    }, [id]);

    const handleApprove = async () => {
        if (!application) return;

        if (!window.confirm('Are you sure you want to approve this application?')) {
            return;
        }

        try {
            const api = await import('../../api/officer.api');
            let response;

            if (application.category === 'TIN') {
                response = await api.approveTinApplication(application.id);
            } else if (application.category === 'VITAL') {
                response = await api.approveVitalApplication(application.type, application.id);
            }

            if (response && response.success) {
                alert('Application approved successfully');
                if (onRefresh) onRefresh();
                onClose();
            } else {
                alert('Failed to approve application: ' + (response?.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Failed to approve application:', err);
            alert('Failed to approve application: ' + (err.message || 'Unknown error'));
        }
    };

    const handleReject = async () => {
        if (!application) return;
        const reason = window.prompt('Please provide a reason for rejection:');
        if (!reason || !reason.trim()) {
            return;
        }

        if (reason.trim().length < 5) {
            alert('Rejection reason must be at least 5 characters long.');
            return;
        }

        try {
            const api = await import('../../api/officer.api');
            let response;

            if (application.category === 'TIN') {
                response = await api.rejectTinApplication(application.id, reason);
            } else if (application.category === 'VITAL') {
                response = await api.rejectVitalApplication(application.type, application.id, reason);
            }

            if (response && response.success) {
                alert('Application rejected successfully');
                if (onRefresh) onRefresh();
                onClose();
            } else {
                alert('Failed to reject application: ' + (response?.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Failed to reject application:', err);
            alert('Failed to reject application: ' + (err.message || 'Unknown error'));
        }
    };

    // Render TIN form data
    const renderTINData = () => {
        if (!application.formData) return <p>No form data available.</p>;

        const { personal, employmentDetails, addressDetails, subcity } = application.formData;

        return (
            <div className="application-details-content">
                {personal && (
                    <div className="detail-section">
                        <h3><i className="fas fa-user"></i> Personal Information</h3>
                        <div className="detail-grid">
                            <div className="detail-item"><label>First Name</label><p>{personal.firstName || 'N/A'}</p></div>
                            {personal.middleName && <div className="detail-item"><label>Middle Name</label><p>{personal.middleName}</p></div>}
                            <div className="detail-item"><label>Last Name</label><p>{personal.lastName || 'N/A'}</p></div>
                            <div className="detail-item"><label>Date of Birth</label><p>{personal.dateOfBirth || 'N/A'}</p></div>
                            <div className="detail-item"><label>Gender</label><p>{personal.gender || 'N/A'}</p></div>
                            {personal.email && <div className="detail-item"><label>Email</label><p>{personal.email}</p></div>}
                            {personal.bankAccountNumber && <div className="detail-item"><label>Bank Account</label><p>{personal.bankAccountNumber}</p></div>}
                            {personal.FAN && <div className="detail-item"><label>FAN</label><p>{personal.FAN}</p></div>}
                        </div>
                    </div>
                )}
                {employmentDetails && (
                    <div className="detail-section">
                        <h3><i className="fas fa-briefcase"></i> Employment Details</h3>
                        <div className="detail-grid">
                            <div className="detail-item"><label>Occupation</label><p>{employmentDetails.occupation || 'N/A'}</p></div>
                            {employmentDetails.employerName && <div className="detail-item"><label>Employer</label><p>{employmentDetails.employerName}</p></div>}
                            {employmentDetails.employerAddress && <div className="detail-item full-width"><label>Employer Address</label><p>{employmentDetails.employerAddress}</p></div>}
                        </div>
                    </div>
                )}
                {addressDetails && (
                    <div className="detail-section">
                        <h3><i className="fas fa-map-marker-alt"></i> Address Details</h3>
                        <div className="detail-grid">
                            <div className="detail-item full-width"><label>Street Address</label><p>{addressDetails.streetAddress || 'N/A'}</p></div>
                            <div className="detail-item"><label>City</label><p>{addressDetails.city || 'N/A'}</p></div>
                            <div className="detail-item"><label>Region</label><p>{addressDetails.region || 'N/A'}</p></div>
                            {addressDetails.postalCode && <div className="detail-item"><label>Postal Code</label><p>{addressDetails.postalCode}</p></div>}
                        </div>
                    </div>
                )}
                {subcity && (
                    <div className="detail-section">
                        <h3><i className="fas fa-city"></i> Subcity</h3>
                        <p>{subcity}</p>
                    </div>
                )}
            </div>
        );
    };

    // Render Birth Certificate form data
    const renderBirthData = () => {
        if (!application.formData || !application.formData.birth) return <p>No form data available.</p>;

        const { birth, subcity } = application.formData;

        return (
            <div className="application-details-content">
                {birth.child && (
                    <div className="detail-section">
                        <h3><i className="fas fa-baby"></i> Child Information</h3>
                        <div className="detail-grid">
                            <div className="detail-item"><label>First Name</label><p>{birth.child.firstName || 'N/A'}</p></div>
                            {birth.child.middleName && <div className="detail-item"><label>Middle Name</label><p>{birth.child.middleName}</p></div>}
                            <div className="detail-item"><label>Last Name</label><p>{birth.child.lastName || 'N/A'}</p></div>
                            <div className="detail-item"><label>Gender</label><p>{birth.child.gender || 'N/A'}</p></div>
                            <div className="detail-item"><label>Date of Birth</label><p>{birth.child.date || 'N/A'}</p></div>
                            {birth.child.time && <div className="detail-item"><label>Time</label><p>{birth.child.time}</p></div>}
                            <div className="detail-item full-width"><label>Place of Birth</label><p>{birth.child.place || 'N/A'}</p></div>
                        </div>
                    </div>
                )}
                {birth.mother && (
                    <div className="detail-section">
                        <h3><i className="fas fa-female"></i> Mother's Information</h3>
                        <div className="detail-grid">
                            <div className="detail-item"><label>First Name</label><p>{birth.mother.firstName || 'N/A'}</p></div>
                            <div className="detail-item"><label>Last Name</label><p>{birth.mother.lastName || 'N/A'}</p></div>
                            <div className="detail-item"><label>Date of Birth</label><p>{birth.mother.date || 'N/A'}</p></div>
                            <div className="detail-item"><label>Nationality</label><p>{birth.mother.nationality || 'N/A'}</p></div>
                            {birth.mother.occupation && <div className="detail-item"><label>Occupation</label><p>{birth.mother.occupation}</p></div>}
                        </div>
                    </div>
                )}
                {birth.father && (
                    <div className="detail-section">
                        <h3><i className="fas fa-male"></i> Father's Information</h3>
                        <div className="detail-grid">
                            <div className="detail-item"><label>First Name</label><p>{birth.father.firstName || 'N/A'}</p></div>
                            <div className="detail-item"><label>Last Name</label><p>{birth.father.lastName || 'N/A'}</p></div>
                            <div className="detail-item"><label>Date of Birth</label><p>{birth.father.date || 'N/A'}</p></div>
                            <div className="detail-item"><label>Nationality</label><p>{birth.father.nationality || 'N/A'}</p></div>
                            {birth.father.occupation && <div className="detail-item"><label>Occupation</label><p>{birth.father.occupation}</p></div>}
                        </div>
                    </div>
                )}
                {birth.medicalFacility && (
                    <div className="detail-section">
                        <h3><i className="fas fa-hospital"></i> Medical Facility</h3>
                        <div className="detail-grid">
                            <div className="detail-item"><label>Facility Name</label><p>{birth.medicalFacility.facilityName || 'N/A'}</p></div>
                            {birth.medicalFacility.attendingPhysician && <div className="detail-item"><label>Attending Physician</label><p>{birth.medicalFacility.attendingPhysician}</p></div>}
                            <div className="detail-item full-width"><label>Address</label><p>{birth.medicalFacility.address || 'N/A'}</p></div>
                        </div>
                    </div>
                )}
                {subcity && (
                    <div className="detail-section">
                        <h3><i className="fas fa-city"></i> Subcity</h3>
                        <p>{subcity}</p>
                    </div>
                )}
            </div>
        );
    };

    // Render Marriage Certificate form data
    const renderMarriageData = () => {
        if (!application.formData || !application.formData.marriage) return <p>No form data available.</p>;

        const { marriage, subcity } = application.formData;

        return (
            <div className="application-details-content">
                {marriage.husband && (
                    <div className="detail-section">
                        <h3><i className="fas fa-user"></i> Husband Information</h3>
                        {marriage.husband.applicantInformation && (
                            <div className="detail-grid">
                                <div className="detail-item"><label>Full Name</label><p>{marriage.husband.applicantInformation.fullName || 'N/A'}</p></div>
                                <div className="detail-item"><label>Date of Birth</label><p>{marriage.husband.applicantInformation.dateOfBirth || 'N/A'}</p></div>
                                <div className="detail-item"><label>Place of Birth</label><p>{marriage.husband.applicantInformation.placeOfBirth || 'N/A'}</p></div>
                                <div className="detail-item"><label>Nationality</label><p>{marriage.husband.applicantInformation.nationality || 'N/A'}</p></div>
                                <div className="detail-item full-width"><label>Address</label><p>{marriage.husband.applicantInformation.address || 'N/A'}</p></div>
                                {marriage.husband.applicantInformation.phoneNumber && <div className="detail-item"><label>Phone</label><p>{marriage.husband.applicantInformation.phoneNumber}</p></div>}
                                {marriage.husband.applicantInformation.emailAddress && <div className="detail-item"><label>Email</label><p>{marriage.husband.applicantInformation.emailAddress}</p></div>}
                            </div>
                        )}
                    </div>
                )}
                {marriage.wife && (
                    <div className="detail-section">
                        <h3><i className="fas fa-user"></i> Wife Information</h3>
                        {marriage.wife.applicantInformation && (
                            <div className="detail-grid">
                                <div className="detail-item"><label>Full Name</label><p>{marriage.wife.applicantInformation.fullName || 'N/A'}</p></div>
                                <div className="detail-item"><label>Date of Birth</label><p>{marriage.wife.applicantInformation.dateOfBirth || 'N/A'}</p></div>
                                <div className="detail-item"><label>Place of Birth</label><p>{marriage.wife.applicantInformation.placeOfBirth || 'N/A'}</p></div>
                                <div className="detail-item"><label>Nationality</label><p>{marriage.wife.applicantInformation.nationality || 'N/A'}</p></div>
                                <div className="detail-item full-width"><label>Address</label><p>{marriage.wife.applicantInformation.address || 'N/A'}</p></div>
                                {marriage.wife.applicantInformation.phoneNumber && <div className="detail-item"><label>Phone</label><p>{marriage.wife.applicantInformation.phoneNumber}</p></div>}
                                {marriage.wife.applicantInformation.emailAddress && <div className="detail-item"><label>Email</label><p>{marriage.wife.applicantInformation.emailAddress}</p></div>}
                            </div>
                        )}
                    </div>
                )}
                {marriage.ceremonyDetails && (
                    <div className="detail-section">
                        <h3><i className="fas fa-heart"></i> Ceremony Details</h3>
                        <div className="detail-grid">
                            <div className="detail-item"><label>Date</label><p>{marriage.ceremonyDetails.date || 'N/A'}</p></div>
                            {marriage.ceremonyDetails.time && <div className="detail-item"><label>Time</label><p>{marriage.ceremonyDetails.time}</p></div>}
                            <div className="detail-item"><label>Place</label><p>{marriage.ceremonyDetails.place || 'N/A'}</p></div>
                            {marriage.ceremonyDetails.officiant && <div className="detail-item"><label>Officiant</label><p>{marriage.ceremonyDetails.officiant}</p></div>}
                        </div>
                    </div>
                )}
                {subcity && (
                    <div className="detail-section">
                        <h3><i className="fas fa-city"></i> Subcity</h3>
                        <p>{subcity}</p>
                    </div>
                )}
            </div>
        );
    };

    const renderApplicationDetails = () => {
        if (!application) return null;

        if (application.category === 'TIN') {
            return renderTINData();
        } else if (application.category === 'VITAL') {
            if (application.type === 'birth') {
                return renderBirthData();
            } else if (application.type === 'marriage') {
                return renderMarriageData();
            }
        }

        return <div className="no-details"><p>No details available for this application type.</p></div>;
    };

    if (loading) {
        return (
            <div className="application-modal-overlay" onClick={onClose}>
                <div className="application-modal-container" onClick={e => e.stopPropagation()}>
                    <div className="loading-overlay">
                        <i className="fas fa-spinner fa-spin"></i> Loading...
                    </div>
                </div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="application-modal-overlay" onClick={onClose}>
                <div className="application-modal-container" onClick={e => e.stopPropagation()}>
                    <div className="error-overlay">
                        <p>{error || 'Application not found.'}</p>
                        <button onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(application.status);
    const isClosed = application.status === 'approved' || application.status === 'rejected';

    return (
        <div className="application-modal-overlay" onClick={onClose}>
            <div className="application-modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Application Details</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="application-header-info">
                        <div className="id-block">
                            <label>Application ID</label>
                            <strong>{application.id}</strong>
                        </div>
                        <div className="meta-badges">
                            <span className="badge type">{application.typeLabel}</span>
                            <span className="badge status" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>

                    <div className="modal-tabs">
                        <button className={`tab-link ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
                            Details
                        </button>
                    </div>

                    <div className="tab-viewport">
                        {activeTab === 'details' && renderApplicationDetails()}
                    </div>

                    {application.rejectionReason && (
                        <div className="rejection-reason-section">
                            <h3><i className="fas fa-exclamation-triangle"></i> Rejection Reason</h3>
                            <p>{application.rejectionReason}</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <div className="action-row">
                        {!isClosed && (
                            <>
                                <button className="btn approve" onClick={handleApprove}>Approve</button>
                                <button className="btn reject" onClick={handleReject}>Reject</button>
                            </>
                        )}
                        <button className="btn close-modal" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicationDetails;
