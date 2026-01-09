import '../../styles/common/HelpCenter.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation1 from '../../components/Navigation1';
import Footer from '../../components/Footer';
import Navigation2 from '../../components/Navigation2';
import { useSearchParams } from 'react-router-dom';

function HelpCenter() {
    const [openFaqs, setOpenFaqs] = useState({});
    const [searchParams] = useSearchParams();
    const navTypeParam = searchParams.get('navType');
    const navType = navTypeParam ? parseInt(navTypeParam) : 1;

    const toggleFaq = (categoryIndex, faqIndex) => {
        const key = `${categoryIndex}-${faqIndex}`;
        setOpenFaqs(prev => {
            // If clicking on an already open FAQ, close it
            if (prev[key]) {
                const { [key]: removed, ...rest } = prev;
                return rest;
            }
            // Otherwise, open this FAQ and close others
            return { [key]: true };
        });
    };

    const isFaqOpen = (categoryIndex, faqIndex) => {
        return openFaqs[`${categoryIndex}-${faqIndex}`] || false;
    };

    const faqData = [
        {
            title: "Login and Account Access",
            icon: "fa-user-circle",
            faqs: [
                {
                    question: "How do I create a CiviLink account?",
                    answer: "To create a CiviLink account, visit our registration page and provide your full name, email address, and create a secure password. You'll receive a verification email to complete the process. All accounts require government-issued ID verification for security purposes."
                },
                {
                    question: "I forgot my password. How can I reset it?",
                    answer: "Click 'Forgot Password' on the login page. Enter your registered email address, and we'll send you a password reset link. For security reasons, the link expires after 30 minutes. If you don't receive the email, check your spam folder."
                },
                {
                    question: "Why is my account locked?",
                    answer: "Accounts may be locked after multiple failed login attempts for security reasons. To unlock your account, use the 'Unlock Account' feature or contact our support team with your registered email and government ID for verification."
                }
            ],
         
        },
        {
            title: "Payment and Transactions",
            icon: "fa-credit-card",
            faqs: [
                {
                    question: "What payment methods are accepted?",
                    answer: "CiviLink accepts telebirr payments . Government fee payments can also be made through authorized banking partners. All transactions are encrypted and secure."
                },
                {
                    question: "How long do refunds take to process?",
                    answer: "Refunds typically process within 7-10 business days. The exact timing depends on your payment method and bank. Government processing fees are non-refundable. You'll receive email confirmation once your refund is initiated."
                },
                {
                    question: "Can I save my payment information?",
                    answer: "Yes, you can securely save payment methods in your account settings. All saved payment information is encrypted and tokenized for maximum security. You can add, edit, or remove payment methods at any time."
                }
            ],
           
        },

        {
            title: "Application Process",
            icon: "fa-file-alt",
            faqs: [
                {
                    question: "How do I apply for a TIN online?",
                    answer: "Navigate to 'TIN Services'in your dashboard, complete the application form, upload required documents (ID, proof of address), and pay the processing fee. Most applications are approved within 3-5 business days. You'll receive updates via email and SMS."
                },
                {
                    question: "What documents do I need for vital registration?",
                    answer: "Required documents vary by service (birth, marriage, death). Generally, you'll need a valid ID, proof of relationship (for marriage/death), and supporting documents like medical certificates. Check the specific service page for detailed requirements."
                },
                {   
                    question: 'Can I track my application status?',
                    answer: "Yes, all applications can be tracked in real-time through your dashboard. You'll see the current stage (submitted, under review, approved, completed) and estimated completion time. Notifications are sent at each milestone."
                }
            ],
           
        }
        
    ];

    return (
        <>
         {navType==1 && <Navigation1></Navigation1>}
         {navType==2 && <Navigation2></Navigation2>}
          
            <div className="help-container">
                <section className="section1">
                    <h1>Help Center</h1>
                    <p>
                        Find answers to your questions, explore common topics, and get the
                        support you need for all CiviLink services.
                    </p>
                </section>


                <section className="section2">
                    <div className="faq-grid">
                        {faqData.map((category, categoryIndex) => (
                            <div className="faq-category" key={categoryIndex}>
                                <h3>
                                    <i className={`fas ${category.icon}`}></i> {category.title}
                                </h3>

                                {category.faqs.map((faq, faqIndex) => {
                                    const isOpen = isFaqOpen(categoryIndex, faqIndex);
                                    return (
                                        <div className="faq-item" key={faqIndex}>
                                            <div className="faq-question">
                                                <h4>{faq.question}</h4>
                                                <button 
                                                    className={`faq-toggle ${isOpen ? 'active' : ''}`} 
                                                    type="button"
                                                    onClick={() => toggleFaq(categoryIndex, faqIndex)}
                                                >
                                                    <i className={`fas ${isOpen ? 'fa-minus' : 'fa-plus'}`}></i>
                                                </button>
                                            </div>
                                            <div className={`faq-answer ${isOpen ? 'active' : ''}`}>
                                                <p>{faq.answer}</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                
                            </div>
                        ))}
                    </div>
                </section>

             


                <section className="section3">
                    <h2>Need more assistance?</h2>
                    <p>
                        If you can't find the answer you're looking for, our support team is
                        ready to help.
                    </p>

                  { navType==1 && <Link to='/contact?navType=1'> 
                    <button className="centered-button" type="button">
                        <i className="fas fa-headset"></i> Contact Support
                    </button>
                </Link>}

                  { navType==2 && <Link to='/contact?navType=2'> 
                    <button className="centered-button" type="button">
                        <i className="fas fa-headset"></i> Contact Support
                    </button>
                </Link>}
                
                    <div className="contact-options">
                        <div className="contact-card">
                            <div className="contact-icon">
                                <i className="fas fa-comments"></i>
                            </div>
                            <h3>Live Chat</h3>
                            <p>Chat with our support agents in real-time</p>
                            <a href="#" className="contact-link">
                                Start Chat <i className="fas fa-arrow-right"></i>
                            </a>
                        </div>

                        <div className="contact-card">
                            <div className="contact-icon">
                                <i className="fas fa-phone-alt"></i>
                            </div>
                            <h3>Phone Support</h3>
                            <p>Call us at 1-800-CIVI-LINK (1-800-248-4546)</p>
                            <a href="#" className="contact-link">
                                Call Now <i className="fas fa-arrow-right"></i>
                            </a>
                        </div>

                        <div className="contact-card">
                            <div className="contact-icon">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <h3>Email Support</h3>
                            <p>Send us an email at support@civilink.gov</p>
                            <a href="#" className="contact-link">
                                Send Email <i className="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        <Footer></Footer>
        </>
    );
}

export default HelpCenter;