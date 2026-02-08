import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/common/Login.css';
import GoogleSvg from '../../assets/uil--google.svg';
import Navigation1 from '../../components/Navigation1';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext.jsx';
import { getGoogleAuthUrl } from '../../api/auth.api.js';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, isAuthenticated, error: authError, clearError } = useAuth();
    
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        user: '',
        loginPassword: '',
        signupPassword: '',
        confirmPassword: '',
        idPhoto: null,
        acceptTerms: false
    });
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fileName, setFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/user/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    // Clear errors when switching forms
    useEffect(() => {
        setError(null);
        clearError();
    }, [isLogin, clearError]);

    // Show auth errors
    useEffect(() => {
        if (authError) {
            setError(authError);
        }
    }, [authError]);

    const handleInputChange = (e) => {
        const { id, value, files, type, checked } = e.target;
        
        if (id === 'idphoto' && files && files.length > 0) {
            setFormData(prev => ({ ...prev, idPhoto: files[0] }));
            setFileName(files[0].name);
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [id]: checked }));
        } else {
            // Map input IDs to formData keys
            const fieldMap = {
                'user': 'user',
                'login-password': 'loginPassword',
                'name': 'name',
                'email': 'email',
                'signup-password': 'signupPassword',
                'confirm': 'confirmPassword',
            };
            
            const fieldName = fieldMap[id] || id;
            setFormData(prev => ({ ...prev, [fieldName]: value }));
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            setFormData(prev => ({ ...prev, idPhoto: file }));
            setFileName(file.name);
        }
    };

    const handleFileClick = () => {
        document.getElementById('idphoto').click();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const result = await login({
                email: formData.user, // Backend expects 'email' field
                password: formData.loginPassword,
                rememberMe: false, // You can add a checkbox for this
            });

            if (result.success) {
                // Wait a tick to ensure auth state is committed
                setTimeout(() => {
                    // Redirect based on role - single source of truth
                    const role = result.data?.role;
                    if (role === 'admin') {
                        navigate('/admin/dashboard', { replace: true });
                    } else if (role === 'officer') {
                        navigate('/officer/dashboard', { replace: true });
                    } else {
                        // Default to citizen dashboard
                        navigate('/user/dashboard', { replace: true });
                    }
                }, 100);
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.acceptTerms) {
            setError('You must accept the terms and conditions');
            return;
        }

        if (formData.signupPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await register({
                fullName: formData.name,
                email: formData.email,
                password: formData.signupPassword,
                confirmPassword: formData.confirmPassword,
                acceptTerms: formData.acceptTerms,
            });

            if (result.success) {
                // Redirect to user dashboard after registration
                navigate('/user/dashboard', { replace: true });
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during registration');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleAuth = () => {
        // Redirect to Google OAuth endpoint
        window.location.href = getGoogleAuthUrl();
    };

    return (
        <>
        <Navigation1></Navigation1>
        <div className="login-container">
        <section className="login-signup">
            <div className="switch-btn">
                <button 
                    id="log-btn" 
                    className={isLogin ? 'active' : ''}
                    onClick={() => setIsLogin(true)}
                >
                    Login
                </button>
                <button 
                    id="sign-btn" 
                    className={!isLogin ? 'active' : ''}
                    onClick={() => setIsLogin(false)}
                >
                    Sign Up
                </button>
            </div>

            <div className="form-container">
                {/* Login Form */}
                <form 
                    className={`login-form ${!isLogin ? 'hidden' : ''}`}
                    onSubmit={handleLoginSubmit}
                >
                    <div className="welcome-text">
                        <h1>Welcome Back!</h1>
                        <span>Sign in to continue</span>
                    </div>

                    {error && (
                        <div className="error-message" style={{ 
                            color: 'red', 
                            marginBottom: '1rem',
                            padding: '0.5rem',
                            backgroundColor: '#ffe6e6',
                            borderRadius: '4px'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="data">
                        <label htmlFor="user">Email</label>
                        <input 
                            type="email" 
                            id="user" 
                            placeholder="Enter your email"
                            value={formData.user}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="data">
                        <label htmlFor="login-password">Password</label>
                        <div className="password-container">
                            <input 
                                type={showLoginPassword ? "text" : "password"} 
                                id="login-password" 
                                placeholder="Enter your password"
                                value={formData.loginPassword}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                            />
                            <button 
                                type="button" 
                                className="password-toggle" 
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                            >
                                <i className={`far fa-eye${showLoginPassword ? '-slash' : ''}`}></i>
                            </button>
                        </div>
                    </div>

                    <a href="#" id="forgot">Forgot Password?</a>

                    <div className="form-foot">
                        <button 
                            className="form-btn" 
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </button>
                        <span>OR CONTINUE WITH</span>
                        <button 
                            className="google-btn" 
                            type="button"
                            onClick={handleGoogleAuth}
                        >
                            <img 
                                src={GoogleSvg}
                                style={{ backgroundColor: '#333' }} 
                                alt="google-logo"
                            />
                            Log in with Google
                        </button>
                    </div>
                </form>

                {/* Sign Up Form */}
                <form 
                    className={`signup-form ${isLogin ? 'hidden' : ''}`}
                    onSubmit={handleSignupSubmit}
                >
                    <div className="welcome-text">
                        <h1>Create Your Account</h1>
                        <span>Sign up to access all CiviLink Services</span>
                    </div>

                    {error && (
                        <div className="error-message" style={{ 
                            color: 'red', 
                            marginBottom: '1rem',
                            padding: '0.5rem',
                            backgroundColor: '#ffe6e6',
                            borderRadius: '4px'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="data">
                        <label htmlFor="name">Full Name</label>
                            <input 
                                id="name" 
                                type="text" 
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                            />
                    </div>
                    
                    <div className="data">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className="data">
                        <label htmlFor="signup-password">Password</label>
                        <div className="password-container">
                            <input 
                                type={showSignupPassword ? "text" : "password"} 
                                id="signup-password" 
                                placeholder="Enter your password"
                                value={formData.signupPassword}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                            />
                            <button 
                                type="button" 
                                className="password-toggle" 
                                onClick={() => setShowSignupPassword(!showSignupPassword)}
                            >
                                <i className={`far fa-eye${showSignupPassword ? '-slash' : ''}`}></i>
                            </button>
                        </div>
                    </div>

                    <div className="data">
                        <label htmlFor="confirm">Confirm Password</label>
                        <div className="password-container">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                id="confirm" 
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                            />
                            <button 
                                type="button" 
                                className="password-toggle" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <i className={`far fa-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                            </button>
                        </div>
                    </div>
                    
                    <div className="data">
                        <label>
                            <input 
                                type="checkbox" 
                                id="acceptTerms"
                                checked={formData.acceptTerms}
                                onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                                required
                                disabled={isSubmitting}
                            />
                            <span>I accept the terms and conditions</span>
                        </label>
                    </div>

                    <div className="data">
                        <label htmlFor="idphoto">Upload ID photo (Optional)</label>
                        <div 
                            className="filedrop" 
                            id="file-drop-area"
                            onClick={handleFileClick}
                            onDrop={handleFileDrop}
                            onDragOver={handleDragOver}
                        >
                            <div className="file-upload-icon">
                                <i className="fas fa-cloud-upload-alt"></i>
                            </div>
                            <p>Drag & Drop your ID photo here, or click to browse</p>
                            <small>Max file size: 5MB</small>
                            {fileName && (
                                <div className="file-name" id="file-name-display">
                                    {fileName}
                                </div>
                            )}
                            <input 
                                type="file" 
                                id="idphoto" 
                                accept="image/*" 
                                style={{ display: 'none' }}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-foot">
                        <button 
                            className="form-btn" 
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </button>
                        <span>OR CONTINUE WITH</span>
                        <button 
                            className="google-btn" 
                            type="button"
                            onClick={handleGoogleAuth}
                        >
                            <img 
                                src={GoogleSvg}
                                style={{ backgroundColor: '#333' }} 
                                alt="google-logo"
                            />
                            Sign up with Google
                        </button>
                    </div>
                </form>
            </div>
        </section>
        </div>
        <Footer></Footer>
        </>
    );
}

export default Login;