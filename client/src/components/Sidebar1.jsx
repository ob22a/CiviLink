/**
 * Sidebar1 Component
 * 
 * Sidebar for citizen users.
 * Shows user-specific navigation menu.
 */

import '../styles/components/Sidebar1.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import LogoutModal from './common/LogoutModal.jsx';
import { useMemo, useState } from 'react';

function SideBar1() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Get user's first name for welcome message
    const firstName = useMemo(() => {
        if (!user?.fullName) return 'User';
        return user.fullName.split(' ')[0];
    }, [user]);

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

    return (
        <>
            <aside className="sidebar1">
                <div className="welcome-card">
                    <h2>Welcome back, {firstName}!</h2>
                    <p>Manage your applications and track their status.</p>
                    <NavLink to="/user/applications" className="explore-btn">
                        View All Applications
                    </NavLink>
                </div>

                <div className="dashboard-menu">
                    <NavLink
                        to="/user/dashboard"
                        className={({ isActive }) =>
                            `menu-item ${isActive ? 'active' : ''}`
                        }
                        end // This ensures exact match for /user/dashboard
                    >
                        <i className="fas fa-home"></i>
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/user/applications"
                        className={({ isActive }) =>
                            `menu-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <i className="fas fa-file-alt"></i>
                        <span>My Applications</span>
                    </NavLink>

                    <NavLink
                        to="/user/messages"
                        className={({ isActive }) =>
                            `menu-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <i className="fas fa-envelope"></i>
                        <span>Inbox</span>
                    </NavLink>

                    <NavLink
                        to="/user/settings"
                        className={({ isActive }) =>
                            `menu-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <i className="fas fa-user-circle"></i>
                        <span>Profile Settings</span>
                    </NavLink>

                    <NavLink
                        to="/help?navType=2"
                        className={({ isActive }) =>
                            `menu-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <i className="fas fa-question-circle"></i>
                        <span>Help Center</span>
                    </NavLink>

                    <button
                        className="menu-item logout-item"
                        onClick={handleLogoutClick}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <LogoutModal
                isOpen={showLogoutModal}
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
            />
        </>
    )
}

export default SideBar1;
