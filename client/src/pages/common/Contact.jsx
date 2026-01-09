import React, { useState, useEffect } from 'react';
import '../../styles/common/Contact.css';
import Navigation1 from '../../components/Navigation1';
import Footer from '../../components/Footer';
import Navigation2 from '../../components/Navigation2';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import * as chatAPI from '../../api/chat.api';
import { useChat } from '../../auth/ChatContext';

function Contact() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navTypeParam = searchParams.get('navType');
    const navType = navTypeParam ? parseInt(navTypeParam) : 1;

    const { submitSupportInquiry, isLoading: chatLoading, error: chatError, clearError } = useChat();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        service: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Pre-fill user data if logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.fullName || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });
        clearError();

        try {
            const payload = {
                subject: formData.subject,
                message: formData.message,
                subcity: user?.subcity || 'Global',
                guestName: !user ? formData.name : undefined,
                guestEmail: !user ? formData.email : undefined
            };

            const result = await submitSupportInquiry(payload);

            if (result.success) {
                setStatus({ type: 'success', message: 'Thank you! Your message has been sent successfully.' });
                setFormData(prev => ({
                    ...prev,
                    subject: '',
                    message: '',
                    service: ''
                }));
            }
        } catch (error) {
            console.error('Contact form error:', error);
            setStatus({ type: 'error', message: chatError || error.message || 'An error occurred. Please try again later.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {navType == 1 && <Navigation1></Navigation1>}
            {navType == 2 && <Navigation2></Navigation2>}
            <div className="contact-container">
                <main className="main-content">
                    <div className="page-header">
                        <h1>Get in Touch with CiviLink Support</h1>
                        <p>Whether you have questions, feedback, or need assistance, our team is here to help. Reach out to us using the form below or find our contact details.</p>
                    </div>

                    <div className="contact-content-grid">
                        <div className="contact-form">
                            <h2>Send Us a Message</h2>
                            {status.message && (
                                <div className={`status-alert ${status.type}`}>
                                    {status.message}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Your Name <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        required
                                        disabled={!!user}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Your Email <span className="required">*</span></label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john.doe@example.com"
                                        required
                                        disabled={!!user}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">Subject <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Regarding my application"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Message <span className="required">*</span></label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Please describe your inquiry in detail..."
                                        required
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="service">Related Service (Optional)</label>
                                    <select
                                        id="service"
                                        name="service"
                                        value={formData.service}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a service</option>
                                        <option value="tin">TIN Registration</option>
                                        <option value="birth">Birth Certificate</option>
                                        <option value="marriage">Marriage Certificate</option>
                                        <option value="tracker">Application Tracker</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                        {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                                        {isSubmitting ? ' Sending...' : ' Send Message'}
                                    </button>
                                    <button type="reset" className="reset-btn" onClick={() => setFormData({ ...formData, subject: '', message: '', service: '' })}>
                                        <i className="fas fa-redo"></i> Reset Form
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="contact-info">
                            <h2>Our Contact Information</h2>

                            <div className="info-item">
                                <div className="info-icon">
                                    <i className="fas fa-phone"></i>
                                </div>
                                <div className="info-content">
                                    <h3>Phone Number</h3>
                                    <p>Available Monday-Friday, 8:00 AM - 6:00 PM</p>
                                    <a href="tel:+251912345678">+251 912 345 678</a>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <div className="info-content">
                                    <h3>Email Address</h3>
                                    <p>We typically respond within 24 hours</p>
                                    <a href="mailto:support@civilink.gov">support@civilink.gov</a>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div className="info-content">
                                    <h3>Office Location</h3>
                                    <p>Visit us during business hours</p>
                                    <p>123 Government Street, Suite 400<br />Addis Ababa, Ethiopia</p>
                                </div>
                            </div>

                            <div className="office-hours">
                                <h3>Office Hours</h3>
                                <div className="hours-grid">
                                    <div className="hour-item">
                                        <span className="day">Monday - Friday</span>
                                        <span className="time">8:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="hour-item">
                                        <span className="day">Saturday</span>
                                        <span className="time">9:00 AM - 2:00 PM</span>
                                    </div>
                                    <div className="hour-item">
                                        <span className="day">Sunday</span>
                                        <span className="time">Closed</span>
                                    </div>
                                    <div className="hour-item">
                                        <span className="day">Public Holidays</span>
                                        <span className="time">Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="faq-section">
                        <h2>Frequently Asked Questions</h2>
                        <div className="faq-grid">
                            <div className="faq-item">
                                <h3>How long does it take to get a response?</h3>
                                <p>We typically respond to emails within 24 hours during business days. For urgent matters, please call our support line.</p>
                            </div>

                            <div className="faq-item">
                                <h3>Can I track my application status?</h3>
                                <p>Yes, you can track your application status using our online tracker. You'll need your application reference number.</p>
                            </div>

                            <div className="faq-item">
                                <h3>What documents do I need for TIN application?</h3>
                                <p>You'll need a valid ID document, proof of address, and recent passport-sized photograph. Specific requirements may vary.</p>
                            </div>

                            <div className="faq-item">
                                <h3>Is my personal information secure?</h3>
                                <p>Yes, we use industry-standard encryption and security measures to protect your personal information and documents.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer></Footer>
        </>
    );
}

export default Contact;
