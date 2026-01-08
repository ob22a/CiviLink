/**
 * Role constants
 * 
 * Defines all user roles in the system
 * These must match the backend enum values exactly
 */

export const ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
  ADMIN: 'admin',
};

/**
 * Officer departments
 * These must match the backend enum values exactly
 */
export const OFFICER_DEPARTMENTS = {
  APPROVER: 'approver',
  CUSTOMER_SUPPORT: 'customer_support',
};

/**
 * Officer permission flags
 * Derived from officer's department and writeNews flag
 */
export const PERMISSIONS = {
  CAN_APPROVE: 'canApprove',        // department === 'approver'
  CUSTOMER_SUPPORT: 'customerSupport', // department === 'customer_support'
  CAN_WRITE_NEWS: 'canWriteNews',   // writeNews === true
};

