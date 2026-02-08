/**
 * Authentication Reducer
 * 
 * Manages authentication state:
 * - User data
 * - Authentication status
 * - Loading states
 * - Error states
 */

export const authActions = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN_START: 'REFRESH_TOKEN_START',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILURE: 'REFRESH_TOKEN_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
};

/**
 * Computes officer permissions from user data
 * @param {Object} user - User object (may be Officer)
 * @returns {Object} Permission flags
 */
export const computePermissions = (user) => {
  if (!user || user.role !== 'officer') {
    return {
      canApprove: false,
      customerSupport: false,
      canWriteNews: false,
    };
  }

  return {
    canApprove: user.department === 'approver',
    customerSupport: user.department === 'customer_support',
    canWriteNews: user.writeNews === true,
  };
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case authActions.LOGIN_START:
    case authActions.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case authActions.LOGIN_SUCCESS:
    case authActions.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case authActions.LOGIN_FAILURE:
    case authActions.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case authActions.LOGOUT:
      return {
        ...initialState,
      };

    case authActions.REFRESH_TOKEN_START:
      return {
        ...state,
        isRefreshing: true,
      };

    case authActions.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isRefreshing: false,
        error: null,
      };

    case authActions.REFRESH_TOKEN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isRefreshing: false,
        error: action.payload,
      };

    case authActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

