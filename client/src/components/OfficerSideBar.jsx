/**
 * OfficerSideBar Component
 * 
 * Permission-driven sidebar for officers.
 * Menu items are shown/hidden based on officer permissions:
 * - canApprove: Shows applications section (for approvers)
 * - customerSupport: Shows message center (for support officers)
 * - canWriteNews: Shows news section (for news writers)
 * 
 * All officers see Dashboard and Settings.
 */

import '../styles/components/OfficerSideBar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { usePermissions } from '../hooks/usePermissions.js';
import LogoutModal from './common/LogoutModal.jsx';
import { useMemo, useState } from 'react';

function OfficerSideBar() {
    const { user, logout } = useAuth();
    const { canApprove, canSupport, canWriteNews } = usePermissions();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Get user's first name for welcome message
    const firstName = useMemo(() => {
        if (!user?.fullName) return 'Officer';
        return user.fullName.split(' ')[0];
    }, [user]);

    // Build menu items based on permissions
    const menuItems = useMemo(() => {
        const items = [
            {
                path: '/officer/dashboard',
                icon: 'fas fa-home',
                label: 'Dashboard',
                show: true, // Always show
            },
        ];

        // Only show Applications if officer can approve
        if (canApprove) {
            items.push({
                path: '/officer/applications',
                icon: 'fas fa-file-alt',
                label: 'Applications',
                show: true,
            });
        }

        // Only show Message Center if officer has customer support permission
        if (canSupport) {
            items.push({
                path: '/officer/messages',
                icon: 'fas fa-comments',
                label: 'Message Center',
                show: true,
            });
        }

        // Only show News if officer can write news
        if (canWriteNews) {
            items.push({
                path: '/officer/news',
                icon: 'fas fa-newspaper',
                label: 'News',
                show: true,
            });
        }

        // Always show Settings
        items.push({
            path: '/officer/settings',
            icon: 'fas fa-user-circle',
            label: 'Profile Settings',
            show: true,
        });

        return items.filter(item => item.show);
    }, [canApprove, canSupport, canWriteNews]);

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
            <aside className="officer-bar">
                <div className="welcome-card">
                    <h2>Welcome back, {firstName}!</h2>
                    <p>
                        {canApprove && 'You have applications to review'}
                        {canSupport && !canApprove && 'You have messages to respond to'}
                        {!canApprove && !canSupport && 'Welcome to your dashboard'}
                    </p>
                </div>

                <div className="dashboard-menu">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `menu-item ${isActive ? 'active' : ''}`
                            }
                            end={item.path === '/officer/dashboard'}
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

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

export default OfficerSideBar;