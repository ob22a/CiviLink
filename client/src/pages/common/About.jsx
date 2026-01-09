import '../../styles/common/About.css';

import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';
import Navigation1 from '../../components/Navigation1';
function About() {
  return (
    <>
      <Navigation1></Navigation1>
      <div className='about-container'>
      <section className="hero">
        <div className="hero-text">
          <h1>Simplifying civic processes through technology</h1>
          <p>CiviLink was born from a vision to revolutionize public services, integrating essential functionalities like Taxpayer Identification Number (TIN) registration, Vital Registration, and a suite of e-government services into one seamless, user-friendly platform. Our project aims to cut down bureaucracy, enhance accessibility, and foster transparency for all citizens.</p>
          
          <div className="hero-buttons">
            <Link to='/login'><button className="btn-primary">
              <i className="fas fa-rocket"></i> Get Started Now
            </button></Link>
            
          </div>
          
          <div className="stats">
            <div className="stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Citizens Served</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support Available</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>
        
        <div className="hero-img-container">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
            alt="CiviLink platform interface on devices" 
            className="hero-img"
          />
        </div>
      </section>
      
      {/* Vision Section */}
      <section className="centered-text first">
        <h2 className="centered-h2">Our Vision for a Connected Future</h2>
        <p className="centered-p">We envision a future where civic engagement is effortless, and governmental services are accessible to everyone, everywhere. By continuously innovating and leveraging cutting-edge technology, CiviLink aims to be the leading platform for digital civic services, fostering trust and efficiency between citizens and government. Our goal is to empower communities through digital inclusion, making every civic process clear, quick, and convenient.</p>
        
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', maxWidth: '300px', padding: '25px', borderRadius: '15px', background: 'rgba(67, 97, 238, 0.05)' }}>
            <i className="fas fa-bolt" style={{ fontSize: '2.5rem', color: '#4361ee', marginBottom: '15px' }}></i>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#2d3748' }}>Fast & Efficient</h3>
            <p style={{ color: '#4a5568' }}>Reduce processing times from weeks to minutes with our streamlined digital workflows.</p>
          </div>
          
          <div style={{ textAlign: 'center', maxWidth: '300px', padding: '25px', borderRadius: '15px', background: 'rgba(67, 97, 238, 0.05)' }}>
            <i className="fas fa-shield-alt" style={{ fontSize: '2.5rem', color: '#4361ee', marginBottom: '15px' }}></i>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#2d3748' }}>Secure & Private</h3>
            <p style={{ color: '#4a5568' }}>Bank-level encryption ensures your personal data remains confidential and protected.</p>
          </div>
          
          <div style={{ textAlign: 'center', maxWidth: '300px', padding: '25px', borderRadius: '15px', background: 'rgba(67, 97, 238, 0.05)' }}>
            <i className="fas fa-users" style={{ fontSize: '2.5rem', color: '#4361ee', marginBottom: '15px' }}></i>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#2d3748' }}>User-Centric Design</h3>
            <p style={{ color: '#4a5568' }}>Intuitive interfaces designed for all ages and technical skill levels.</p>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="centered-text second">
        <h2 className="centered-h2-second">Need Help?</h2>
        <p className="centered-p-second">Our dedicated support team is ready to assist you with any questions or issues. Visit our Help Center for FAQs, guides, and contact options.</p>
        <Link to='/help'><button className="centered-button">
          <i className="fas fa-question-circle"></i> Visit Help Center
        </button></Link>
        
        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center' }}>
            <i className="fas fa-headset" style={{ fontSize: '2.5rem', marginBottom: '15px', color: 'rgba(255, 255, 255, 0.9)' }}></i>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'white' }}>24/7 Live Support</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Chat with our experts anytime</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <i className="fas fa-file-alt" style={{ fontSize: '2.5rem', marginBottom: '15px', color: 'rgba(255, 255, 255, 0.9)' }}></i>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'white' }}>Detailed Guides</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Step-by-step instructions</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <i className="fas fa-comments" style={{ fontSize: '2.5rem', marginBottom: '15px', color: 'rgba(255, 255, 255, 0.9)' }}></i>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'white' }}>Community Forum</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Connect with other users</p>
          </div>
        </div>
      </section>
      </div>
     <Footer></Footer>
    </>
  );
}

export default About;