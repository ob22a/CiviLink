/**
 * Profile Assets Context
 * 
 * Manages user ID assets (Fayda, Kebele) state.
 * Uses profileAssetsReducer.
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { profileAssetsReducer, profileAssetsActions } from '../reducers/profileAssetsReducer.js';
import * as idUploadAPI from '../api/idUpload.api.js';

const ProfileAssetsContext = createContext(null);

export const useProfileAssets = () => {
    const context = useContext(ProfileAssetsContext);
    if (!context) {
        throw new Error('useProfileAssets must be used within a ProfileAssetsProvider');
    }
    return context;
};

export const ProfileAssetsProvider = ({ children }) => {
    const [state, dispatch] = useReducer(profileAssetsReducer, {
        faydaId: { exists: false, data: null, uploadStatus: 'idle' },
        kebeleId: { exists: false, data: null, uploadStatus: 'idle' },
        isLoading: false,
        error: null,
    });

    // Computed simple status for IDGuard convenience
    const idStatus =
        (state.faydaId.exists && state.kebeleId.exists) ? 'BOTH' :
            (state.faydaId.exists) ? 'ONLY_FAYDA' :
                (state.kebeleId.exists) ? 'ONLY_KEBELE' : 'NONE';

    // Fetch ID data/status
    const fetchIdData = useCallback(async () => {
        dispatch({ type: profileAssetsActions.FETCH_ID_DATA_START });
        try {
            const result = await idUploadAPI.getIDUploadStatus();
            dispatch({ type: profileAssetsActions.FETCH_ID_DATA_SUCCESS, payload: result });
            return { success: true, data: result };
        } catch (error) {
            dispatch({ type: profileAssetsActions.FETCH_ID_DATA_FAILURE, payload: error.message });
            return { success: false, error: error.message };
        }
    }, []);

    // Upload Fayda
    const uploadFayda = useCallback(async (file) => {
        dispatch({ type: profileAssetsActions.UPLOAD_FAYDA_START });
        try {
            const result = await idUploadAPI.uploadFaydaID(file);
            dispatch({ type: profileAssetsActions.UPLOAD_FAYDA_SUCCESS, payload: result });
            // Re-fetch status to ensure consistency
            setTimeout(() => fetchIdData(), 500);
            return { success: true, data: result };
        } catch (error) {
            dispatch({ type: profileAssetsActions.UPLOAD_FAYDA_FAILURE, payload: error.message });
            return { success: false, error: error.message };
        }
    }, [fetchIdData]);

    // Upload Kebele
    const uploadKebele = useCallback(async (file) => {
        dispatch({ type: profileAssetsActions.UPLOAD_KEBELE_START });
        try {
            const result = await idUploadAPI.uploadKebeleID(file);
            dispatch({ type: profileAssetsActions.UPLOAD_KEBELE_SUCCESS, payload: result });
            setTimeout(() => fetchIdData(), 500);
            return { success: true, data: result };
        } catch (error) {
            dispatch({ type: profileAssetsActions.UPLOAD_KEBELE_FAILURE, payload: error.message });
            return { success: false, error: error.message };
        }
    }, [fetchIdData]);

    // Delete ID info
    const deleteId = useCallback(async (type) => {
        dispatch({ type: profileAssetsActions.DELETE_ID_START });
        try {
            await idUploadAPI.deleteIDInfo(type);
            dispatch({
                type: profileAssetsActions.DELETE_ID_SUCCESS,
                payload: { idType: type }
            });
            setTimeout(() => fetchIdData(), 500);
            return { success: true };
        } catch (error) {
            dispatch({ type: profileAssetsActions.DELETE_ID_FAILURE, payload: error.message });
            return { success: false, error: error.message };
        }
    }, [fetchIdData]);

    // Clear errors
    const clearError = useCallback(() => {
        dispatch({ type: profileAssetsActions.CLEAR_ERROR });
    }, []);

    const value = {
        // State
        faydaId: state.faydaId,
        kebeleId: state.kebeleId,
        isLoading: state.isLoading,
        error: state.error,
        idStatus, // derived helper

        // Actions
        fetchIdData,
        uploadFayda,
        uploadKebele,
        deleteId,
        clearError,
    };

    return <ProfileAssetsContext.Provider value={value}>{children}</ProfileAssetsContext.Provider>;
};
