/**
 * Profile Assets Reducer
 * 
 * Manages ID upload state based on backend API responses:
 * - Fayda ID status and data
 * - Kebele ID status and data
 * - Upload/delete operations
 * 
 * State reflects what backend says about ID existence and data
 */

export const profileAssetsActions = {
    // Fetch ID data
    FETCH_ID_DATA_START: 'FETCH_ID_DATA_START',
    FETCH_ID_DATA_SUCCESS: 'FETCH_ID_DATA_SUCCESS',
    FETCH_ID_DATA_FAILURE: 'FETCH_ID_DATA_FAILURE',

    // Upload Fayda ID
    UPLOAD_FAYDA_START: 'UPLOAD_FAYDA_START',
    UPLOAD_FAYDA_SUCCESS: 'UPLOAD_FAYDA_SUCCESS',
    UPLOAD_FAYDA_FAILURE: 'UPLOAD_FAYDA_FAILURE',

    // Upload Kebele ID
    UPLOAD_KEBELE_START: 'UPLOAD_KEBELE_START',
    UPLOAD_KEBELE_SUCCESS: 'UPLOAD_KEBELE_SUCCESS',
    UPLOAD_KEBELE_FAILURE: 'UPLOAD_KEBELE_FAILURE',

    // Delete ID (Right to be Forgotten)
    DELETE_ID_START: 'DELETE_ID_START',
    DELETE_ID_SUCCESS: 'DELETE_ID_SUCCESS',
    DELETE_ID_FAILURE: 'DELETE_ID_FAILURE',

    // Clear error
    CLEAR_ERROR: 'CLEAR_ERROR',
};

const initialState = {
    // Fayda ID state
    faydaId: {
        exists: false,
        data: null,
        uploadStatus: 'idle', // 'idle' | 'uploading' | 'success' | 'error'
    },

    // Kebele ID state
    kebeleId: {
        exists: false,
        data: null,
        uploadStatus: 'idle',
    },

    // Loading state
    isLoading: false,

    // Error state
    error: null,
};

/**
 * Profile Assets Reducer
 * @param {Object} state - Current state
 * @param {Object} action - Action with type and payload
 * @returns {Object} New state
 */
export const profileAssetsReducer = (state = initialState, action) => {
    switch (action.type) {
        case profileAssetsActions.FETCH_ID_DATA_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case profileAssetsActions.FETCH_ID_DATA_SUCCESS: {
            // Backend returns { success: true, data: { fayda: ..., kebele: ... } }
            // apiRequest returns the full object.
            const { fayda, kebele } = action.payload.data || action.payload;

            return {
                ...state,
                faydaId: {
                    exists: !!fayda,
                    data: fayda || null,
                    uploadStatus: fayda ? 'success' : 'idle',
                },
                kebeleId: {
                    exists: !!kebele,
                    data: kebele || null,
                    uploadStatus: kebele ? 'success' : 'idle',
                },
                isLoading: false,
                error: null,
            };
        }

        case profileAssetsActions.FETCH_ID_DATA_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };

        case profileAssetsActions.UPLOAD_FAYDA_START:
            return {
                ...state,
                faydaId: {
                    ...state.faydaId,
                    uploadStatus: 'uploading',
                },
                error: null,
            };

        case profileAssetsActions.UPLOAD_FAYDA_SUCCESS:
            return {
                ...state,
                faydaId: {
                    exists: true,
                    data: action.payload.extractedData || action.payload.data || null,
                    uploadStatus: 'success',
                },
                error: null,
            };

        case profileAssetsActions.UPLOAD_FAYDA_FAILURE:
            return {
                ...state,
                faydaId: {
                    ...state.faydaId,
                    uploadStatus: 'error',
                },
                error: action.payload,
            };

        case profileAssetsActions.UPLOAD_KEBELE_START:
            return {
                ...state,
                kebeleId: {
                    ...state.kebeleId,
                    uploadStatus: 'uploading',
                },
                error: null,
            };

        case profileAssetsActions.UPLOAD_KEBELE_SUCCESS:
            return {
                ...state,
                kebeleId: {
                    exists: true,
                    data: action.payload.extractedData || action.payload.data || null,
                    uploadStatus: 'success',
                },
                error: null,
            };

        case profileAssetsActions.UPLOAD_KEBELE_FAILURE:
            return {
                ...state,
                kebeleId: {
                    ...state.kebeleId,
                    uploadStatus: 'error',
                },
                error: action.payload,
            };

        case profileAssetsActions.DELETE_ID_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case profileAssetsActions.DELETE_ID_SUCCESS: {
            const { idType } = action.payload;

            // Handle 'both', 'fayda', or 'kebele'
            const resetFayda = idType === 'both' || idType === 'fayda';
            const resetKebele = idType === 'both' || idType === 'kebele';

            return {
                ...state,
                faydaId: resetFayda ? {
                    exists: false,
                    data: null,
                    uploadStatus: 'idle',
                } : state.faydaId,
                kebeleId: resetKebele ? {
                    exists: false,
                    data: null,
                    uploadStatus: 'idle',
                } : state.kebeleId,
                isLoading: false,
                error: null,
            };
        }

        case profileAssetsActions.DELETE_ID_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };

        case profileAssetsActions.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};
