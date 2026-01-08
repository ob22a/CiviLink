import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import '../styles/components/Footer.css';


function Footer(){
     return(
     <>
    <div className="footer-wrapper">
     <div className="footer-container">
            <div className="footer-section logo-section">
                <div className="logo-wrapper">
                    <img src={logo} alt="CiviLink Logo"/>
                    <span className="logo-text">CiviLink</span>
                </div>
                <p className="tagline">Simplifying civic services through digital innovation. Making government interactions accessible, secure, and efficient for every citizen.</p>
            </div>
            
            <div className="footer-section">
                <h4>Company</h4>
                <ul>
                    <li><Link to="/about">About Us</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                   
                </ul>
            </div>
            
            <div className="footer-section">
                <h4>Legal</h4>
                <ul>
                    <li><Link to="/privacy">Privacy Policy</Link></li>
                    <li><Link to="/terms">Terms of Service</Link></li>
                    
                </ul>
            </div>
            
            <div className="footer-section social-section">
                <h4>Connect With Us</h4>
                <div className="icon-links">
                    <a href="https://facebook.com" aria-label="Facebook">
                        <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://twitter.com" aria-label="Twitter">
                        <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://linkedin.com" aria-label="LinkedIn">
                        <i className="fab fa-linkedin-in"></i>
                    </a>
                    <a href="https://instagram.com" aria-label="Instagram">
                        <i className="fab fa-instagram"></i>
                    </a>
                </div>
                
                <div className="contact-info">
                    <div className="contact-item">
                        <i className="fas fa-envelope"></i>
                        <span>support@civilink.gov</span>
                    </div>
                    <div className="contact-item">
                        <i className="fas fa-phone"></i>
                        <span>1-800-CIVI-LINK</span>
                    </div>
                    <div className="contact-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>123 Civic Center, Capital City</span>
                    </div>
                </div>
            </div>
        </div>
        
        <hr/>
        
        <div className="copyright-section">
            <p className="copyright">© 2023 CiviLink. All rights reserved. A Government Digital Service Initiative.</p>
            <div className="legal-links">
                
                <Link to="/contact">Contact</Link>
            </div>
        </div></div>
     </>
        
     );
}

export default Footer;

