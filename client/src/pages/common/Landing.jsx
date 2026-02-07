import React from 'react';
import logo from '../../assets/logo.png';
import hero from '../../assets/hero.png';
import '../../styles/common/Landing.css'
import Navigation1 from '../../components/Navigation1';

import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import { useAuth } from '../../auth/AuthContext.jsx';

function Landing() {
    const { isAuthenticated, role, isLoading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isLoading && isAuthenticated) {
            if (role === 'citizen') navigate('/user/dashboard');
            else if (role === 'officer') navigate('/officer/dashboard');
            else if (role === 'admin') navigate('/admin/dashboard');
        }
    }, [isAuthenticated, role, isLoading, navigate]);

    if (isLoading) {
        return <div className="loading-screen">Loading...</div>;
    }

    return (

        <>
            <Navigation1></Navigation1>
            <div className='landing-container'>
                <section className="hero">

                    <div className="hero-text">
                        <h1>A unified civic service platform for TIN and Vital Registration</h1>
                        <p>Civilink simplifies government interactions, making it easier for citizens to access essential services online securely and efficiently.</p>
                        <Link to="/login" className="btn">Login/Sign Up</Link>
                    </div>
                    <div className="hero-img-container">
                        <img src={hero} alt="Civilink platform interface on devices" className="hero-img" />
                    </div>
                </section>


                <section className="section">
                    <h2 className="section-title">Why Choose CiviLink?</h2>

                    <div className="course-cards">
                        <div className="card">
                            <div className="icon-container">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                                    <g fill="none" stroke="#258cf4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                                        <path d="M18.709 3.495C16.817 2.554 14.5 2 12 2s-4.816.554-6.709 1.495c-.928.462-1.392.693-1.841 1.419S3 6.342 3 7.748v3.49c0 5.683 4.542 8.842 7.173 10.196c.734.377 1.1.566 1.827.566s1.093-.189 1.827-.566C16.457 20.08 21 16.92 21 11.237V7.748c0-1.406 0-2.108-.45-2.834s-.913-.957-1.841-1.419" />
                                        <path d="M9 11.5s1.408.252 2 2c0 0 1.5-3 4-4" />
                                    </g>
                                </svg>
                            </div>
                            <h3>Secure Online Payments</h3>
                            <p>Your transactions are protected with industry-leading encryption and multi-factor authentication standards.</p>
                            <a href="#" className="card-link">
                                Learn more
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" />
                                    <path d="m12 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>

                        <div className="card">
                            <div className="icon-container">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                                    <path fill="#258cf4" d="M9.5 6.495a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-6a1 1 0 0 1-1-1m4.637 2h2.226c.058 0 .139 0 .212.006c.088.007.229.027.379.103a1 1 0 0 1 .437.437c.077.15.096.29.103.379c.006.073.006.154.006.212v1.726c0 .058 0 .139-.006.212a1 1 0 0 1-.103.379a1 1 0 0 1-.437.437a1 1 0 0 1-.379.103a3 3 0 0 1-.212.006h-2.226c-.058 0-.139 0-.212-.006a1 1 0 0 1-.379-.103a1 1 0 0 1-.437-.437a1 1 0 0 1-.103-.379C13 11.497 13 11.416 13 11.358V9.632c0-.058 0-.139.006-.212c.007-.088.027-.229.103-.379a1 1 0 0 1 .437-.437c.15-.076.29-.096.379-.103c.073-.006.154-.006.212-.006m.363 1.5v1H16v-1zm-4.25-1.25a.75.75 0 1 0 0 1.5h1.25a.75.75 0 0 0 0-1.5zm0 2.25a.75.75 0 0 0 0 1.5h1.25a.75.75 0 0 0 0-1.5zm0 2.75a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5z" />
                                    <path fill="#258cf4" d="M16.33 2.745h-5.66c-.535 0-.98 0-1.345.03c-.38.03-.736.098-1.073.27A2.75 2.75 0 0 0 7.05 4.247c-.172.337-.24.693-.27 1.073c-.03.365-.03.81-.03 1.345v10.08H4.5a.75.75 0 0 0-.75.75c0 1.683.572 2.68 1.3 3.225c.406.304.934.524 1.449.525h10.149c.707 0 1.452.03 2.1-.3a2.75 2.75 0 0 0 1.202-1.201c.172-.338.24-.694.27-1.074c.03-.365.03-.81.03-1.345V6.665c0-.535 0-.98-.03-1.345c-.03-.38-.098-.736-.27-1.073a2.75 2.75 0 0 0-1.201-1.202c-.338-.172-.694-.24-1.074-.27c-.365-.03-.81-.03-1.345-.03m1.092 16.987a1.2 1.2 0 0 1-.472-.212c-.272-.204-.7-.708-.7-2.025a.75.75 0 0 0-.75-.75H8.25V6.695c0-.572 0-.957.025-1.253c.023-.287.065-.424.111-.514a1.25 1.25 0 0 1 .547-.547c.09-.046.227-.088.514-.111c.296-.024.68-.025 1.253-.025h5.6c.572 0 .957 0 1.252.025c.288.023.425.065.515.111c.236.12.427.311.547.547c.046.09.088.227.111.514c.024.296.025.68.025 1.253v10.6c0 .572 0 .957-.025 1.252c-.023.288-.065.425-.111.515a1.25 1.25 0 0 1-.547.547c-.142.072-.296.107-.645.123m-10.91.013h-.01l-.008-.002a1.2 1.2 0 0 1-.544-.223c-.213-.16-.521-.503-.645-1.275h9.487c.07.604.225 1.098.437 1.5z" />
                                </svg>
                            </div>
                            <h3>Trusted by Sub-City Administrations</h3>
                            <p>Officially endorsed and utilized across multiple sub-city administrations for reliable civic services.</p>
                            <a href="#" className="card-link">
                                See partners
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" />
                                    <path d="m12 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>

                        <div className="card">
                            <div className="icon-container">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                                    <path fill="none" stroke="#258cf4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m5.226 11.33l6.998-8.983c.547-.703 1.573-.266 1.573.67V9.97c0 .56.402 1.015.899 1.015H18.1c.773 0 1.185 1.03.674 1.686l-6.998 8.983c-.547.702-1.573.265-1.573-.671V14.03c0-.56-.403-1.015-.899-1.015H5.9c-.773 0-1.185-1.03-.674-1.686" />
                                </svg>
                            </div>
                            <h3>Fast, Transparent Service</h3>
                            <p>Experience expedited processing with clear visibility into your application status at every step.</p>
                            <a href="#" className="card-link">
                                Track status
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" />
                                    <path d="m12 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </section>
            </div>
            <Footer></Footer>
        </>




    )
};


export default Landing;
