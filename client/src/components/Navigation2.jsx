/**
 * Navigation2 Component
 * 
 * Role-aware navigation bar for authenticated users.
 * Shows different content based on user role (citizen, officer, admin).
 * Includes notification bell and user profile.
 */

import Logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { NotificationBell } from './notifications/NotificationBell.jsx';
import LogoutModal from './common/LogoutModal.jsx';
import { useState } from 'react';
import '../styles/components/Navigation2.css';

function Navigation2(){
    const { user, logout, role } = useAuth();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Get user initials for avatar
    const getInitials = (fullName) => {
        if (!fullName) return 'U';
        const parts = fullName.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return fullName.substring(0, 2).toUpperCase();
    };

    // Get dashboard path based on role
    const getDashboardPath = () => {
        if (role === 'admin') return '/admin/dashboard';
        if (role === 'officer') return '/officer/dashboard';
        return '/user/dashboard';
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = async () => {
        setShowLogoutModal(false);
        await logout();
        navigate('/login');
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    if (!user) {
        return null;
    }

    return (
        <>
            <div className="nav2">
                <nav className="navbar">
                    <Link to={getDashboardPath()} className="logo">
                        <img src={Logo} alt="CiviLink Logo" />
                        <span>CiviLink</span>
                    </Link>
                    
                    <div className="nav-right">
                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* User Profile */}
                        <div className="user-profile">
                            <div className="user-avatar">
                                {getInitials(user.fullName)}
                            </div>
                            <div className="user-info">
                                <div style={{ fontWeight: 600 }}>{user.fullName}</div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                    {role === 'admin' ? 'Administrator' : 
                                     role === 'officer' ? `Officer - ${user.department || 'N/A'}` :
                                     `Citizen`}
                                </div>
                            </div>
                            <div className="user-menu">
                                <button className="logout-btn" onClick={handleLogoutClick} title="Logout">
                                    <i className="fas fa-sign-out-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
            <LogoutModal
                isOpen={showLogoutModal}
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
            />
        </>
    );
}

export default Navigation2;
