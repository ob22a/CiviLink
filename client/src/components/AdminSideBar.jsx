import '../styles/components/AdminSideBar.css';
import { useAuth } from '../hooks/useAuth';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LogoutModal from './common/LogoutModal';

function AdminSideBar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = (e) => {
        e.preventDefault();
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
            <aside className="admin-bar">
                <div className="welcome-card">
                    <h2>Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}!</h2>
                    <p>You have a lot of tasks to perform</p>
                </div>

                <div className="dashboard-menu">
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) =>
                            `menu-item ${isActive ? 'active' : ''}`
                        }
                        end
                    >
                        <i className="fas fa-home"></i>
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/admin/manage-officers"
                        className={({ isActive }) =>
                            `menu-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <i className="fas fa-file-alt"></i>
                        <span>Manage Officers</span>
                    </NavLink>

                    <NavLink
                        to="/admin/security-report"
                        className={({ isActive }) =>
                            `menu-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <i className="fas fa-user-circle"></i>
                        <span>Security Report</span>
                    </NavLink>

                    <NavLink
                        to="/admin/performance"
                        className={({ isActive }) =>
                            `menu-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <i className="fas fa-question-circle"></i>
                        <span>Performance monitoring</span>
                    </NavLink>

                    <NavLink
                        to="/admin/settings"
                        className={({ isActive }) =>
                            `menu-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <i className="fas fa-eye"></i>
                        <span>Profile Setting</span>
                    </NavLink>

                    <button
                        className="menu-item logout-item"
                        onClick={handleLogoutClick}
                        style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
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

export default AdminSideBar;