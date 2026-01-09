import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { applicationReducer, applicationActions } from '../reducers/applicationReducer.js';
import * as applicationsAPI from '../api/applications.api.js';

const ApplicationContext = createContext(null);

export const useApplication = () => {
    const context = useContext(ApplicationContext);
    if (!context) {
        throw new Error('useApplication must be used within an ApplicationProvider');
    }
    return context;
};

export const ApplicationProvider = ({ children }) => {
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

    /**
     * Fetch all applications for the current user
     */
    const fetchApplications = useCallback(async (page = 1, limit = 10) => {
        dispatch({ type: applicationActions.FETCH_APPLICATIONS_START });
        try {
            const response = await applicationsAPI.getAllApplications(page, limit);
            dispatch({ type: applicationActions.FETCH_APPLICATIONS_SUCCESS, payload: response });
            return { success: true, data: response.data };
        } catch (error) {
            dispatch({ type: applicationActions.FETCH_APPLICATIONS_FAILURE, payload: error.message });
            return { success: false, error: error.message };
        }
    }, []);

    /**
     * Fetch single application details (or select from list if present)
     */
    const getApplicationDetails = useCallback(async (appId) => {
        dispatch({ type: applicationActions.FETCH_APPLICATION_DETAILS_START });
        try {
            // First try to find in current list to save network (optional, but good for UX)
            const existing = state.applications.find(a => a._id === appId);

            // Note: We always fetch to ensure fresh status, but you could return existing if needed
            // For now, let's just hit the API for details if we have an endpoint, 
            // OR if the list only has summary data.
            // Since we added getApplicationById, we use it.

            const response = await applicationsAPI.getApplicationById(appId);
            dispatch({ type: applicationActions.FETCH_APPLICATION_DETAILS_SUCCESS, payload: response });
            return { success: true, data: response.data };
        } catch (error) {
            dispatch({ type: applicationActions.FETCH_APPLICATION_DETAILS_FAILURE, payload: error.message });
            return { success: false, error: error.message };
        }
    }, [state.applications]);

    /**
     * Submit a new application
     */
    const submitApplication = useCallback(async (type, formData) => {
        dispatch({ type: applicationActions.SUBMIT_APPLICATION_START });
        try {
            let response;
            if (type === 'tin') {
                response = await applicationsAPI.submitTinApplication(formData);
            } else {
                response = await applicationsAPI.submitVitalApplication(type, formData);
            }

            dispatch({ type: applicationActions.SUBMIT_APPLICATION_SUCCESS, payload: response.data });
            return { success: true, data: response.data };
        } catch (error) {
            dispatch({ type: applicationActions.SUBMIT_APPLICATION_FAILURE, payload: error.message });
            return { success: false, error: error.message };
        }
    }, []);

    const clearError = useCallback(() => {
        dispatch({ type: applicationActions.CLEAR_ERROR });
    }, []);

    const value = {
        applications: state.applications,
        selectedApplication: state.selectedApplication,
        isLoading: state.isLoading,
        isSubmitting: state.isSubmitting,
        error: state.error,
        fetchApplications,
        getApplicationDetails,
        submitApplication,
        clearError
    };

    return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
};
