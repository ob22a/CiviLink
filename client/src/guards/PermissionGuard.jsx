/**
 * PermissionGuard Component
 * 
 * Protects routes that require specific permissions.
 * Used for officer-specific features based on their department/permissions.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePermissions } from '../hooks/usePermissions.js';

/**
 * PermissionGuard - Protects routes by permission
 * @param {Object} props
 * @param {ReactNode} props.children - Child components to render if authorized
 * @param {string|string[]} props.requiredPermissions - Permission(s) required to access
 * @param {ReactNode} props.fallback - Optional fallback component (default: redirect to officer dashboard)
 */
export const PermissionGuard = ({ 
  children, 
  requiredPermissions, 
  fallback = null 
}) => {
  const { isAuthenticated, isOfficer } = useAuth();
  const { hasPermission } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isOfficer) {
    // Only officers have permissions
    return <Navigate to="/login" replace />;
  }

  const permissionsArray = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];
  
  const hasRequiredPermission = permissionsArray.some(perm => hasPermission(perm));

  if (!hasRequiredPermission) {
    if (fallback) {
      return fallback;
    }

    // Default: redirect to officer dashboard
    return <Navigate to="/officer/dashboard" replace />;
  }

  return children;
};

