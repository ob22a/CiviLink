/**
 * RoleGuard Component
 * 
 * Protects routes that require specific roles.
 * Redirects unauthorized users based on their role.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePermissions } from '../hooks/usePermissions.js';

/**
 * RoleGuard - Protects routes by role
 * @param {Object} props
 * @param {ReactNode} props.children - Child components to render if authorized
 * @param {string|string[]} props.allowedRoles - Role(s) allowed to access
 * @param {ReactNode} props.fallback - Optional fallback component (default: redirect to appropriate dashboard)
 */
export const RoleGuard = ({ children, allowedRoles, fallback = null }) => {
  const { role, isAuthenticated } = useAuth();
  const { isCitizen, isOfficer, isAdmin } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasRequiredRole = rolesArray.includes(role);

  if (!hasRequiredRole) {
    if (fallback) {
      return fallback;
    }

    // Redirect to appropriate dashboard based on role
    if (isCitizen) {
      return <Navigate to="/user/dashboard" replace />;
    }
    if (isOfficer) {
      return <Navigate to="/officer/dashboard" replace />;
    }
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }

    // Fallback to login if role is unknown
    return <Navigate to="/login" replace />;
  }

  return children;
};

