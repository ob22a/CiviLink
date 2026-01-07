/**
 * useApplicationState Hook
 * 
 * Custom hook for managing application state using useReducer.
 * Provides:
 * - Application list and details
 * - Submission state
 * - Derived values (filtered applications)
 * - API integration with useCallback
 * 
 * @example
 * const {
 *   applications,
 *   isLoading,
 *   pendingApplications,
 *   fetchApplications,
 *   submitApplication
 * } = useApplicationState();
 */

import { useReducer, useCallback, useMemo } from 'react';
import { applicationReducer, applicationActions } from '../reducers/applicationReducer.js';
import {
    getAllApplications,
    submitTinApplication,
    submitVitalApplication,
    downloadCertificate,
} from '../api/applications.api.js';
import { getApplicationDetails } from '../api/officer.api.js';

/**
 * Custom hook for application state management
 * @returns {Object} Application state and actions
 */
export const useApplicationState = () => {
    const [state, dispatch] = useReducer(applicationReducer, {
        applications: [],
        selectedApplication: null,
        isLoading: false,
        isSubmitting: false,
        error: null,
        pagination: {
            page: 1,
            totalPages: 1,
            total: 0,
        },
    });

    // ===== Actions =====

    /**
     * Fetch all applications for current user (citizen)
     */
    const fetchApplications = useCallback(async (page, limit) => {
        dispatch({ type: applicationActions.FETCH_APPLICATIONS_START });
        try {
            const data = await getAllApplications(page, limit);
            dispatch({
                type: applicationActions.FETCH_APPLICATIONS_SUCCESS,
                payload: data
            });
        } catch (error) {
            dispatch({
                type: applicationActions.FETCH_APPLICATIONS_FAILURE,
                payload: error.message || 'Failed to fetch applications'
            });
        }
    }, []);

    /**
     * Fetch application details (officer view)
     * @param {string} applicationId - Application ID
     */
    const fetchApplicationDetails = useCallback(async (applicationId) => {
        dispatch({ type: applicationActions.FETCH_APPLICATION_DETAILS_START });
        try {
            const data = await getApplicationDetails(applicationId);
            dispatch({
                type: applicationActions.FETCH_APPLICATION_DETAILS_SUCCESS,
                payload: data
            });
        } catch (error) {
            dispatch({
                type: applicationActions.FETCH_APPLICATION_DETAILS_FAILURE,
                payload: error.message || 'Failed to fetch application details'
            });
        }
    }, []);

    /**
     * Submit TIN application
     * @param {Object} formData - TIN application data
     */
    const submitTin = useCallback(async (formData) => {
        dispatch({ type: applicationActions.SUBMIT_APPLICATION_START });
        try {
            const data = await submitTinApplication(formData);
            dispatch({
                type: applicationActions.SUBMIT_APPLICATION_SUCCESS,
                payload: data
            });
            return data;
        } catch (error) {
            dispatch({
                type: applicationActions.SUBMIT_APPLICATION_FAILURE,
                payload: error.message || 'Failed to submit TIN application'
            });
            throw error;
        }
    }, []);

    /**
     * Submit vital record application
     * @param {string} type - Type of vital record (birth, marriage, death)
     * @param {Object} formData - Vital application data
     */
    const submitVital = useCallback(async (type, formData) => {
        dispatch({ type: applicationActions.SUBMIT_APPLICATION_START });
        try {
            const data = await submitVitalApplication(type, formData);
            dispatch({
                type: applicationActions.SUBMIT_APPLICATION_SUCCESS,
                payload: data
            });
            return data;
        } catch (error) {
            dispatch({
                type: applicationActions.SUBMIT_APPLICATION_FAILURE,
                payload: error.message || 'Failed to submit vital application'
            });
            throw error;
        }
    }, []);

    /**
     * Download certificate for approved application
     * @param {string} applicationId - Application ID
     */
    const downloadCert = useCallback(async (applicationId) => {
        try {
            downloadCertificate(applicationId);
            console.log("Redirect to download page");
        } catch (error) {
            dispatch({
                type: applicationActions.FETCH_APPLICATIONS_FAILURE,
                payload: error.message || 'Failed to download certificate'
            });
            throw error;
        }
    }, []);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        dispatch({ type: applicationActions.CLEAR_ERROR });
    }, []);

    /**
     * Clear selected application
     */
    const clearSelected = useCallback(() => {
        dispatch({ type: applicationActions.CLEAR_SELECTED });
    }, []);

    // ===== Derived State =====

    /**
     * Check if user has any applications
     */
    const hasApplications = useMemo(
        () => state.applications.length > 0,
        [state.applications]
    );

    /**
     * Get pending applications
     */
    const pendingApplications = useMemo(
        () => state.applications.filter(app => app.status === 'pending'),
        [state.applications]
    );

    /**
     * Get approved applications
     */
    const approvedApplications = useMemo(
        () => state.applications.filter(app => app.status === 'approved'),
        [state.applications]
    );

    /**
     * Get rejected applications
     */
    const rejectedApplications = useMemo(
        () => state.applications.filter(app => app.status === 'rejected'),
        [state.applications]
    );

    /**
     * Count applications by status
     */
    const applicationCounts = useMemo(
        () => ({
            total: state.applications.length,
            pending: pendingApplications.length,
            approved: approvedApplications.length,
            rejected: rejectedApplications.length,
        }),
        [state.applications, pendingApplications, approvedApplications, rejectedApplications]
    );

    // ===== Return API =====

    return {
        // State
        applications: state.applications,
        selectedApplication: state.selectedApplication,
        isLoading: state.isLoading,
        isSubmitting: state.isSubmitting,
        error: state.error,
        pagination: state.pagination,

        // Derived values
        hasApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        applicationCounts,

        // Actions
        fetchApplications,
        fetchApplicationDetails,
        submitTin,
        submitVital,
        downloadCert,
        clearError,
        clearSelected,
    };
};
