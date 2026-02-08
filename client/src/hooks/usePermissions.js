/**
 * usePermissions Hook
 * 
 * Provides convenient access to user permissions.
 * This hook wraps the auth context's permission logic.
 */

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { PERMISSIONS } from '../constants/roles.js';

/**
 * Custom hook to check user permissions
 * @returns {Object} Permission checks and helper methods
 */
export const usePermissions = () => {
  const { permissions, hasPermission, hasRole, role } = useAuth();

  // Memoized permission checks
  const canApprove = useMemo(
    () => hasPermission(PERMISSIONS.CAN_APPROVE),
    [hasPermission]
  );

  const canSupport = useMemo(
    () => hasPermission(PERMISSIONS.CUSTOMER_SUPPORT),
    [hasPermission]
  );

  const canWriteNews = useMemo(
    () => hasPermission(PERMISSIONS.CAN_WRITE_NEWS),
    [hasPermission]
  );

  const isCitizen = useMemo(() => hasRole('citizen'), [hasRole]);
  const isOfficer = useMemo(() => hasRole('officer'), [hasRole]);
  const isAdmin = useMemo(() => hasRole('admin'), [hasRole]);

  return {
    // Permission flags
    canApprove,
    canSupport,
    canWriteNews,
    
    // Role checks
    isCitizen,
    isOfficer,
    isAdmin,
    
    // Raw access
    permissions,
    role,
    hasPermission,
    hasRole,
  };
};

