import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/user/TIN.css';
import FormSideBar from '../../components/FormSideBar';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';
import { useAuth } from '../../context/AuthContext';
import { useProfileAssets } from '../../context/ProfileAssetsContext';
import PaymentModal from '../../components/common/PaymentModal';
import * as applicationsAPI from '../../api/applications.api';
import * as userAPI from '../../api/user.api';

function TIN() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { idStatus } = useProfileAssets();

    const [formData, setFormData] = useState({
        formType: 'TIN',
        firstName: '',
        middleName: '',
        lastName: '',
        dob: '',
        gender: '',
        maritalStatus: '',
        nationality: 'Ethiopian',
        occupation: '',
        employerName: '',
        employerAddress: '',
        streetAddress: '',
        city: '',
        region: '',
        postalCode: '',
        confirmation: false,
    });

    const [applicationId, setApplicationId] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Populate user info and ID data if available
    useEffect(() => {
        const loadInitialData = async () => {
            // 1. Pre-populate from User record (AuthContext)
            if (user?.fullName) {
                const parts = user.fullName.split(' ');
                setFormData(prev => ({
                    ...prev,
                    firstName: parts[0] || '',
                    lastName: parts[parts.length - 1] || '',
                    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : ''
                }));
            }

            // 2. Pre-populate from Extracted ID Data (Backend OCR stored data)
            try {
                const idResult = await userAPI.getIDData();
                if (idResult.success && idResult.data) {
                    const { fayda, kebele } = idResult.data;
                    const idData = fayda || kebele; // Prefer Fayda if both exist

                    if (idData) {
                        setFormData(prev => ({
                            ...prev,
                            firstName: idData.fullName?.split(' ')[0] || prev.firstName,
                            lastName: idData.fullName?.split(' ').pop() || prev.lastName,
                            middleName: idData.fullName?.split(' ').slice(1, -1).join(' ') || prev.middleName,
                            dob: idData.dateOfBirth ? idData.dateOfBirth.split('T')[0] : prev.dob,
                            gender: idData.sex ? idData.sex.toLowerCase() : prev.gender
                        }));
                    }
                }
            } catch (error) {
                console.error("Error loading ID data for pre-population:", error);
            }
        };

        loadInitialData();
    }, [user]);



    const sidebarData = {
        formType: "TIN Application",
        estimatedTime: "7-10 Business Days",
        applicationFee: "100",
        status: "In Progress",
        statusColor: "#f59e0b"
    };

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [id]: type === 'checkbox' ? checked : value,
        });
    };

    const handlePreSubmit = async (e) => {
        e.preventDefault();

        if (idStatus !== 'BOTH') {
            alert("You need to upload both Fayda and Kebele IDs to proceed.");
            navigate('/user/settings');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await applicationsAPI.submitTinApplication(formData);
            if (result.success) {
                setApplicationId(result.applicationId);
                localStorage.setItem('pending_app_id_tin', result.applicationId);
                localStorage.setItem('pending_form_tin', JSON.stringify(formData));

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
            <div className="tin-form">
                <FormSideBar formData={sidebarData}></FormSideBar>
                <div className="main-content">
                    <div className="application-header">
                        <h1>Taxpayer Identification Number (TIN) Application</h1>
                        <p>
                            Complete all sections below to apply for your Taxpayer Identification Number. Fields marked with{' '}
                            <span className="required">*</span> are required.
                        </p>
                    </div>

                    <form onSubmit={handlePreSubmit}>
                        {/* Section 1: Personal Details */}
                        <div className="form-section">
                            <h2>Personal Details</h2>
                            <p>Provide your full legal name, date of birth, and other personal information.</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>
                                        First Name <span className="required">*</span>
                                    </label>
                                    <input type="text" id="firstName" value={formData.firstName} onChange={handleChange} required />
                                </div>

                                <div className="form-group">
                                    <label>Middle Name</label>
                                    <input type="text" id="middleName" value={formData.middleName} onChange={handleChange} />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Last Name <span className="required">*</span>
                                    </label>
                                    <input type="text" id="lastName" value={formData.lastName} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>
                                        Date of Birth <span className="required">*</span>
                                    </label>
                                    <input type="date" id="dob" value={formData.dob} onChange={handleChange} required />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Gender <span className="required">*</span>
                                    </label>
                                    <select id="gender" value={formData.gender} onChange={handleChange} required>
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Marital Status <span className="required">*</span>
                                    </label>
                                    <select id="maritalStatus" value={formData.maritalStatus} onChange={handleChange} required>
                                        <option value="">Select Status</option>
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                        <option value="divorced">Divorced</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>
                                        Nationality <span className="required">*</span>
                                    </label>
                                    <input type="text" id="nationality" value={formData.nationality} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Employment Details */}
                        <div className="form-section">
                            <h2>Employment Details</h2>
                            <p>Provide information about your current employment.</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>
                                        Occupation <span className="required">*</span>
                                    </label>
                                    <input type="text" id="occupation" value={formData.occupation} onChange={handleChange} required />
                                </div>

                                <div className="form-group">
                                    <label>Employer Name</label>
                                    <input type="text" id="employerName" value={formData.employerName} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Employer Address</label>
                                <textarea id="employerAddress" value={formData.employerAddress} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Section 3: Address Details */}
                        <div className="form-section">
                            <h2>Address Details</h2>
                            <p>Your primary residential or business address.</p>

                            <h3>
                                Street Address <span className="required">*</span>
                            </h3>

                            <div className="form-group address-input">
                                <input
                                    type="text"
                                    id="streetAddress"
                                    value={formData.streetAddress}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your street address"
                                />
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>
                                        City <span className="required">*</span>
                                    </label>
                                    <input type="text" id="city" value={formData.city} onChange={handleChange} required />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Region/State <span className="required">*</span>
                                    </label>
                                    <input type="text" id="region" value={formData.region} onChange={handleChange} required />
                                </div>

                                <div className="form-group">
                                    <label>Postal Code</label>
                                    <input type="text" id="postalCode" value={formData.postalCode} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="checkbox-group">
                                <input type="checkbox" id="confirmation" checked={formData.confirmation} onChange={handleChange} required />
                                <label htmlFor="confirmation">
                                    I confirm that all provided information and documents are authentic and accurate.{' '}
                                    <span className="required">*</span>
                                </label>
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
                            <p className="submit-info">Payment of {sidebarData.applicationFee} ETB is required before submission.</p>
                        </div>
                    </form>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                application={{
                    _id: applicationId,
                    category: 'TIN',
                    type: 'tin',
                    serviceType: 'tin',
                    fee: sidebarData.applicationFee,
                    phoneNumber: user?.phoneNumber || ''
                }}
            />
        </AuthenticatedLayout>
    );
}

export default TIN;