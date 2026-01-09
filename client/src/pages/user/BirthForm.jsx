import React, { useState, useEffect } from 'react';
import '../../styles/user/BirthForm.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FormSideBar from '../../components/FormSideBar';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';

import { useAuth } from '../../auth/AuthContext';
import { useProfileAssets } from '../../auth/ProfileAssetsContext';
import { usePayment } from '../../auth/PaymentContext.jsx';
import PaymentModal from '../../components/common/PaymentModal';
import * as applicationsAPI from '../../api/applications.api';
import * as userAPI from '../../api/user.api';

function BirthForm() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { idStatus } = useProfileAssets();

    // Form state for all inputs
    const [formData, setFormData] = useState({
        formType: 'birth certificate application',
        // Child's Information
        childFirstName: '',
        childMiddleName: '',
        childLastName: '',
        childGender: '',
        childDOB: '',
        childTimeOfBirth: '',
        placeOfBirth: '',

        // Mother's Information
        motherFirstName: '',
        motherLastName: '',
        motherDOB: '',
        motherNationality: 'Ethiopian',
        motherID: '',
        motherOccupation: '',

        // Father's Information
        fatherFirstName: '',
        fatherLastName: '',
        fatherDOB: '',
        fatherNationality: 'Ethiopian',
        fatherID: '',
        fatherOccupation: '',

        // Medical Facility Information
        facilityName: '',
        attendingPhysician: '',
        facilityAddress: ''
    });

    const [applicationId, setApplicationId] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sidebarData = {
        formType: "Birth Certificate",
        estimatedTime: "7-10 Business Days",
        applicationFee: "100",
        status: "In Progress",
        statusColor: "#f59e0b"
    };

    // Populate parent info if it's the current user
    useEffect(() => {
        const loadInitialData = async () => {
            // Pre-populate from Extracted ID Data
            try {
                const idResult = await userAPI.getIDData();
                if (idResult.success && idResult.data) {
                    const { fayda, kebele } = idResult.data;
                    const idData = fayda || kebele;

                    if (idData) {
                        const parts = idData.fullName?.split(' ') || [];
                        const firstName = parts[0] || '';
                        const lastName = parts.pop() || '';

                        // We don't know if the user is mother or father, 
                        // but we can pre-fill some fields based on sex if we want to be smart.
                        if (idData.sex?.toLowerCase() === 'female') {
                            setFormData(prev => ({
                                ...prev,
                                motherFirstName: firstName,
                                motherLastName: lastName,
                                motherDOB: idData.dateOfBirth ? idData.dateOfBirth.split('T')[0] : '',
                                motherID: idData.fan || idData.idNumber || ''
                            }));
                        } else if (idData.sex?.toLowerCase() === 'male') {
                            setFormData(prev => ({
                                ...prev,
                                fatherFirstName: firstName,
                                fatherLastName: lastName,
                                fatherDOB: idData.dateOfBirth ? idData.dateOfBirth.split('T')[0] : '',
                                fatherID: idData.fan || idData.idNumber || ''
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading ID data for pre-population:", error);
            }
        };

        loadInitialData();
    }, [user]);



    // Handle input changes
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // Handle form submission (Draft Save)
    const handlePreSubmit = async (e) => {
        e.preventDefault();

        if (idStatus !== 'BOTH') {
            alert("You need to upload both Fayda and Kebele IDs to proceed.");
            navigate('/user/settings');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await applicationsAPI.submitVitalApplication('birth', formData);
            if (result.success) {
                setApplicationId(result.applicationId);
                // Save context for redirect recovery
                localStorage.setItem('pending_app_id_birth', result.applicationId);
                localStorage.setItem('pending_form_birth', JSON.stringify(formData));

                setIsPaymentModalOpen(true);
            } else {
                alert(result.message || "Failed to save draft application");
            }
        } catch (error) {
            console.error('Draft save error:', error);
            alert(error.message || "Error saving application draft");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <AuthenticatedLayout showSidebar={true}>
            <div className="birth-form">
                <FormSideBar formData={sidebarData} />
                <div className="main-content">
                    <form onSubmit={handlePreSubmit}>
                        <div className="application-header">
                            <h1>Birth Certificate Application</h1>
                            <p>Complete all sections below to apply for a birth certificate. Fields marked with <span className="required">*</span> are required.</p>
                        </div>

                        {/* Section 1: Child's Information */}
                        <div className="form-section">
                            <h2>Child's Information</h2>
                            <p>Provide the child's birth details and personal information.</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="childFirstName">
                                        First Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="childFirstName"
                                        value={formData.childFirstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="childMiddleName">Middle Name</label>
                                    <input
                                        type="text"
                                        id="childMiddleName"
                                        value={formData.childMiddleName}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="childLastName">
                                        Last Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="childLastName"
                                        value={formData.childLastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="childGender">
                                        Gender <span className="required">*</span>
                                    </label>
                                    <select
                                        id="childGender"
                                        value={formData.childGender}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="female">Female</option>
                                        <option value="male">Male</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="childDOB">
                                        Date of Birth <span className="required">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="childDOB"
                                        value={formData.childDOB}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="childTimeOfBirth">Time of Birth (Optional)</label>
                                    <div className="time-input-container">
                                        <input
                                            type="time"
                                            id="childTimeOfBirth"
                                            value={formData.childTimeOfBirth}
                                            onChange={handleInputChange}
                                            className="time-input"
                                        />
                                        <span className="time-hint">24-hour format</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="placeOfBirth">
                                    Place of Birth <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="placeOfBirth"
                                    value={formData.placeOfBirth}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="City, Hospital/School Name"
                                />
                            </div>
                        </div>

                        {/* Section 2: Parent Information */}
                        <div className="form-section">
                            <h2>Parent Information</h2>
                            <p>Provide information about the child's parents.</p>

                            <div className="parent-grid">
                                <div className="parent-section">
                                    <h3>Mother's Information</h3>
                                    <div className="form-group">
                                        <label htmlFor="motherFirstName">
                                            First Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="motherFirstName"
                                            value={formData.motherFirstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="motherLastName">
                                            Last Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="motherLastName"
                                            value={formData.motherLastName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="motherDOB">
                                            Date of Birth <span className="required">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="motherDOB"
                                            value={formData.motherDOB}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="motherNationality">
                                            Nationality <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="motherNationality"
                                            value={formData.motherNationality}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="motherID">
                                            National ID Number <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="motherID"
                                            value={formData.motherID}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="motherOccupation">Occupation (Optional)</label>
                                        <input
                                            type="text"
                                            id="motherOccupation"
                                            value={formData.motherOccupation}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="parent-section">
                                    <h3>Father's Information</h3>
                                    <div className="form-group">
                                        <label htmlFor="fatherFirstName">
                                            First Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="fatherFirstName"
                                            value={formData.fatherFirstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="fatherLastName">
                                            Last Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="fatherLastName"
                                            value={formData.fatherLastName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="fatherDOB">
                                            Date of Birth <span className="required">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="fatherDOB"
                                            value={formData.fatherDOB}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="fatherNationality">
                                            Nationality <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="fatherNationality"
                                            value={formData.fatherNationality}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="fatherID">
                                            National ID Number <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="fatherID"
                                            value={formData.fatherID}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="fatherOccupation">Occupation (Optional)</label>
                                        <input
                                            type="text"
                                            id="fatherOccupation"
                                            value={formData.fatherOccupation}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Medical Facility Information */}
                        <div className="form-section">
                            <h2>Medical Facility Information</h2>
                            <p>Provide details about the medical facility where the child was born.</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="facilityName">
                                        Facility Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="facilityName"
                                        value={formData.facilityName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="attendingPhysician">Attending Physician (Optional)</label>
                                    <input
                                        type="text"
                                        id="attendingPhysician"
                                        value={formData.attendingPhysician}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="facilityAddress">
                                    Address of Facility <span className="required">*</span>
                                </label>
                                <textarea
                                    id="facilityAddress"
                                    value={formData.facilityAddress}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="submit-section">
                            <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                    <i className="fas fa-file-invoice-dollar"></i>
                                )}
                                {isSubmitting ? ' Submitting...' : ' Submit & Pay Fee'}
                            </button>
                            <p className="submit-info">
                                Payment of {sidebarData.applicationFee} ETB is required before submission.
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                application={{
                    _id: applicationId,
                    category: 'VITAL',
                    type: 'birth',
                    serviceType: 'birth',
                    fee: sidebarData.applicationFee,
                    phoneNumber: user?.phoneNumber || ''
                }}
            />
        </AuthenticatedLayout>
    );
}

export default BirthForm;