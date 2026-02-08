/**
 * Authenticated Layout Component
 * 
 * Shared layout for all authenticated pages.
 * Provides consistent navigation (header with logo + notification bell).
 * Role-aware - shows appropriate sidebar/navigation based on user role.
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Navigation2 from '../Navigation2.jsx';
import SideBar1 from '../Sidebar1.jsx';
import AdminSideBar from '../AdminSideBar.jsx';
import OfficerSideBar from '../OfficerSideBar.jsx';
import Footer from '../Footer.jsx';
import '../../styles/components/AuthenticatedLayout.css';

export const AuthenticatedLayout = ({ children, showSidebar = true }) => {
  const { role } = useAuth();

  return (
    <div className="layout-wrapper">
      <Navigation2 />
      <div className={`authenticated-layout ${role === 'citizen' ? 'user-layout' : role === 'officer' ? 'officer-layout' : 'admin-layout'}`}>
        {showSidebar && (
          <div className="layout-sidebar">
            {role === 'citizen' && <SideBar1 />}
            {role === 'officer' && <OfficerSideBar />}
            {role === 'admin' && <AdminSideBar />}
          </div>
        )}
        <div className="layout-main-content">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthenticatedLayout;

