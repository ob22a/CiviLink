import { useState, useEffect } from "react";
import FormSideBar from "../../components/FormSideBar";
import '../../styles/user/MarriageForm.css';
import { useNavigate, useSearchParams } from "react-router-dom";

import AuthenticatedLayout from "../../components/layout/AuthenticatedLayout";
import { useAuth } from '../../hooks/useAuth';
import { useProfileAssets } from '../../hooks/useProfileAssets';
import { usePayment } from '../../hooks/usePayment';
import PaymentModal from '../../components/common/PaymentModal';
import * as applicationsAPI from '../../api/applications.api';
import * as userAPI from '../../api/user.api';

function MarriageForm() {
    const { user } = useAuth();
    const { idStatus } = useProfileAssets();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { verifyPayment } = usePayment();

    const [formData, setFormData] = useState({
        formType: 'marriage application',
        brideName: "",
        brideDOB: "",
        brideOccupation: "",
        brideNationality: "Ethiopian",
        brideAddress: "",
        groomName: "",
        groomDOB: "",
        groomOccupation: "",
        groomNationality: "Ethiopian",
        groomAddress: "",
        marriageDate: "",
        marriageLocation: "",
        marriageType: "civil",
        registrationNumber: "",
        previousMarriage: false,
        witness1Name: "",
        witness1ID: "",
        witness1Relationship: "",
        witness2Name: "",
        witness2ID: "",
        witness2Relationship: "",
        marriageConfirmation: false,
    });

    const [applicationId, setApplicationId] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sidebarData = {
        formType: "Marriage Certificate",
        estimatedTime: "5-7 Business Days",
        applicationFee: "150",
        status: "In Progress",
        statusColor: "#f59e0b"
    };

    // Pre-populate bride or groom details based on user's identity
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // DON'T MERGE IF WE ARE RETURNING FROM PAYMENT (prevents overwrite of restored form data)
                if (localStorage.getItem('pending_app_id_marriage')) return;

                const idResult = await userAPI.getIDData();
                if (idResult.success && idResult.data) {
                    const { fayda, kebele } = idResult.data;
                    const idData = fayda || kebele;

                    if (idData) {
                        const fullName = idData.fullName || '';
                        const dob = idData.dateOfBirth ? idData.dateOfBirth.split('T')[0] : '';

                        if (idData.sex?.toLowerCase() === 'female') {
                            setFormData(prev => ({
                                ...prev,
                                brideName: fullName,
                                brideDOB: dob
                            }));
                        } else if (idData.sex?.toLowerCase() === 'male') {
                            setFormData(prev => ({
                                ...prev,
                                groomName: fullName,
                                groomDOB: dob
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


    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: type === "checkbox" ? checked : value,
        }));
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
            const result = await applicationsAPI.submitVitalApplication('marriage', formData);
            if (result.success) {
                setApplicationId(result.applicationId);
                localStorage.setItem('pending_app_id_marriage', result.applicationId);
                localStorage.setItem('pending_form_marriage', JSON.stringify(formData));
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
            <div className="marriage-form">
                <FormSideBar formData={sidebarData} />
                <div className="main-content">
                    <form onSubmit={handlePreSubmit}>
                        <div className="application-header">
                            <h1>Marriage Certificate Application</h1>
                            <p>
                                Complete all sections below to apply for your marriage certificate. Fields marked
                                with <span className="required">*</span> are required.
                            </p>
                        </div>

                        {/* Section 1: Couple Information */}
                        <div className="form-section">
                            <h2>Couple Information</h2>
                            <p>Provide information about both spouses.</p>

                            <div className="couple-grid">
                                {/* Bride Information */}
                                <div className="couple-section">
                                    <h3>Bride Information</h3>
                                    <div className="form-group">
                                        <label>
                                            Full Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="brideName"
                                            value={formData.brideName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Date of Birth <span className="required">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="brideDOB"
                                            value={formData.brideDOB}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Occupation <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="brideOccupation"
                                            value={formData.brideOccupation}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Nationality <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="brideNationality"
                                            value={formData.brideNationality}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Address <span className="required">*</span>
                                        </label>
                                        <textarea
                                            id="brideAddress"
                                            value={formData.brideAddress}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Groom Information */}
                                <div className="couple-section">
                                    <h3>Groom Information</h3>
                                    <div className="form-group">
                                        <label>
                                            Full Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="groomName"
                                            value={formData.groomName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Date of Birth <span className="required">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="groomDOB"
                                            value={formData.groomDOB}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Occupation <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="groomOccupation"
                                            value={formData.groomOccupation}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Nationality <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="groomNationality"
                                            value={formData.groomNationality}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Address <span className="required">*</span>
                                        </label>
                                        <textarea
                                            id="groomAddress"
                                            value={formData.groomAddress}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    Marriage Date <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="marriageDate"
                                    value={formData.marriageDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Marriage Location <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="marriageLocation"
                                    value={formData.marriageLocation}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Section 2: Marriage Details */}
                        <div className="form-section">
                            <h2>Marriage Details</h2>
                            <p>Provide specific details about your marriage.</p>

                            <div className="form-group">
                                <label>
                                    Type of Marriage <span className="required">*</span>
                                </label>
                                <div className="radio-row">
                                    <div className="radio-option">
                                        <input
                                            type="radio"
                                            id="civilMarriage"
                                            name="marriageType"
                                            value="civil"
                                            checked={formData.marriageType === "civil"}
                                            onChange={handleChange}
                                            required
                                        />
                                        <label htmlFor="civilMarriage">Civil Marriage</label>
                                    </div>
                                    <div className="radio-option">
                                        <input
                                            type="radio"
                                            id="religiousMarriage"
                                            name="marriageType"
                                            value="religious"
                                            onChange={handleChange}
                                            required
                                        />
                                        <label htmlFor="religiousMarriage">Religious Marriage</label>
                                    </div>
                                    <div className="radio-option">
                                        <input
                                            type="radio"
                                            id="customaryMarriage"
                                            name="marriageType"
                                            value="customary"
                                            onChange={handleChange}
                                            required
                                        />
                                        <label htmlFor="customaryMarriage">Customary Marriage</label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Marriage Registration Number</label>
                                <input
                                    type="text"
                                    id="registrationNumber"
                                    placeholder="Enter registration number if available"
                                    value={formData.registrationNumber}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="checkbox-group">
                                <input
                                    type="checkbox"
                                    id="previousMarriage"
                                    checked={formData.previousMarriage}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="previousMarriage">
                                    Neither party has been previously married or all previous marriages have been
                                    legally dissolved. <span className="required">*</span>
                                </label>
                            </div>
                        </div>

                        {/* Section 3: Witness Information */}
                        <div className="form-section">
                            <h2>Witness Information</h2>
                            <p>Provide information about your marriage witnesses (minimum 2 required).</p>

                            <div className="witness-grid">
                                {/* Witness 1 */}
                                <div className="witness-item">
                                    <h3>Witness 1</h3>
                                    <div className="form-group">
                                        <label>
                                            Full Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="witness1Name"
                                            value={formData.witness1Name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            ID Number <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="witness1ID"
                                            value={formData.witness1ID}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Relationship to Couple <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="witness1Relationship"
                                            value={formData.witness1Relationship}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Witness 2 */}
                                <div className="witness-item">
                                    <h3>Witness 2</h3>
                                    <div className="form-group">
                                        <label>
                                            Full Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="witness2Name"
                                            value={formData.witness2Name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            ID Number <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="witness2ID"
                                            value={formData.witness2ID}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Relationship to Couple <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="witness2Relationship"
                                            value={formData.witness2Relationship}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Section */}
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
                    type: 'marriage',
                    serviceType: 'marriage',
                    fee: sidebarData.applicationFee,
                    phoneNumber: user?.phoneNumber || ''
                }}
            />
        </AuthenticatedLayout>
    );
}

export default MarriageForm;
