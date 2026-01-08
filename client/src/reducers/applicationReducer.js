/**
 * Application Reducer
 * 
 * Manages application state based on backend API responses:
 * - List of applications (citizen view)
 * - Application details (officer view)
 * - Submission status
 * - Loading and error states
 * 
 * State is driven by backend data, not UI assumptions
 */

export const applicationActions = {
    // Fetch all applications (citizen)
    FETCH_APPLICATIONS_START: 'FETCH_APPLICATIONS_START',
    FETCH_APPLICATIONS_SUCCESS: 'FETCH_APPLICATIONS_SUCCESS',
    FETCH_APPLICATIONS_FAILURE: 'FETCH_APPLICATIONS_FAILURE',

    // Fetch application details (officer)
    FETCH_APPLICATION_DETAILS_START: 'FETCH_APPLICATION_DETAILS_START',
    FETCH_APPLICATION_DETAILS_SUCCESS: 'FETCH_APPLICATION_DETAILS_SUCCESS',
    FETCH_APPLICATION_DETAILS_FAILURE: 'FETCH_APPLICATION_DETAILS_FAILURE',

    // Submit application (TIN or Vital)
    SUBMIT_APPLICATION_START: 'SUBMIT_APPLICATION_START',
    SUBMIT_APPLICATION_SUCCESS: 'SUBMIT_APPLICATION_SUCCESS',
    SUBMIT_APPLICATION_FAILURE: 'SUBMIT_APPLICATION_FAILURE',

    // Clear error
    CLEAR_ERROR: 'CLEAR_ERROR',

    // Clear selected application
    CLEAR_SELECTED: 'CLEAR_SELECTED',
};

const initialState = {
    // List of applications from backend
    applications: [],

    // Selected application details (for officer view)
    selectedApplication: null,

    // Loading states
    isLoading: false,
    isSubmitting: false,

    // Error state
    error: null,

    // Pagination (if backend provides it)
    pagination: {
        page: 1,
        totalPages: 1,
        total: 0,
    },
};

/**
 * Application Reducer
 * @param {Object} state - Current state
 * @param {Object} action - Action with type and payload
 * @returns {Object} New state
 */
export const applicationReducer = (state = initialState, action) => {
    switch (action.type) {
        case applicationActions.FETCH_APPLICATIONS_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case applicationActions.FETCH_APPLICATIONS_SUCCESS:
            return {
                ...state,
                applications: action.payload.applications ||
                    (Array.isArray(action.payload.data) ? action.payload.data : action.payload.data?.applications) ||
                    [],
                pagination: action.payload.pagination || state.pagination,
                isLoading: false,
                error: null,
            };

        case applicationActions.FETCH_APPLICATIONS_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };

        case applicationActions.FETCH_APPLICATION_DETAILS_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case applicationActions.FETCH_APPLICATION_DETAILS_SUCCESS:
            return {
                ...state,
                selectedApplication: action.payload.application || action.payload.data?.application || action.payload,
                isLoading: false,
                error: null,
            };

        case applicationActions.FETCH_APPLICATION_DETAILS_FAILURE:
            return {
                ...state,
                selectedApplication: null,
                isLoading: false,
                error: action.payload,
            };

        case applicationActions.SUBMIT_APPLICATION_START:
            return {
                ...state,
                isSubmitting: true,
                error: null,
            };

        case applicationActions.SUBMIT_APPLICATION_SUCCESS:
            return {
                ...state,
                // Optionally add the new application to the list
                applications: action.payload.application
                    ? [...state.applications, action.payload.application]
                    : state.applications,
                isSubmitting: false,
                error: null,
            };

        case applicationActions.SUBMIT_APPLICATION_FAILURE:
            return {
                ...state,
                isSubmitting: false,
                error: action.payload,
            };

        case applicationActions.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        case applicationActions.CLEAR_SELECTED:
            return {
                ...state,
                selectedApplication: null,
            };

        default:
            return state;
    }
};
