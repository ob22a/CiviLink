import '../styles/components/FormSideBar.css';
import {Link} from 'react-router-dom';

function FormSideBar({ formData = {}, applicationType = "Application" }) {
    // Default values if no props are provided
    const {
        formType = applicationType,
        estimatedTime = "5-7 Business Days",
        applicationFee = "ETB 150",
        status = "Ready to Submit",
        statusColor = "#10b981"
    } = formData;
    
    return(
        <aside className="sidebar2">
            <div className="application-summary">
                <h3 className="summary-title">Application Summary</h3>
                <div className="summary-item">
                    <span className="label">Application Type:</span>
                    <span className="value">{formType}</span>
                </div>
                <div className="summary-item">
                    <span className="label">Estimated Time:</span>
                    <span className="value">{estimatedTime}</span>
                </div>
                <div className="summary-item">
                    <span className="label">Application Fee:</span>
                    <span className="value">{applicationFee}</span>
                </div>
                <div className="summary-item">
                    <span className="label">Status:</span>
                    <span className="value" style={{ color: statusColor }}>{status}</span>
                </div>
            </div>

            <div className="dashboard-menu">
                <Link to="/user/dashboard"  className="menu-item" style={{textDecoration:'none'}}>
                    <i className="fas fa-arrow-left"></i>
                    <span>Back to Dashboard</span>
                </Link>

                <Link to="/help?navType=2"  className="menu-item" style={{textDecoration:'none'}}>
                    <i className="fas fa-question-circle"></i>
                    <span>Help & Support</span>
                </Link>
                
            </div>
        </aside>
    );
}

export default FormSideBar;

