/**
 * useProfileAssets Hook
 * 
 * Custom hook for managing ID upload state using useReducer.
 * Provides:
 * - Fayda and Kebele ID status
 * - Upload/delete operations
 * - Derived values (ID existence checks)
 * - API integration with useCallback
 * 
 * @example
 * const {
 *   hasFaydaId,
 *   hasKebeleId,
 *   canSubmitApplications,
 *   uploadFaydaId,
 *   deleteId
 * } = useProfileAssets();
 */

import { useReducer, useCallback, useMemo } from 'react';
import { profileAssetsReducer, profileAssetsActions } from '../reducers/profileAssetsReducer.js';
import {
    uploadFaydaID,
    uploadKebeleID,
    deleteIDInfo,
} from '../api/idUpload.api.js';
import { getIDData } from '../api/user.api.js';

/**
 * Custom hook for profile assets (ID uploads) state management
 * @returns {Object} Profile assets state and actions
 */
export const useProfileAssets = () => {
    const [state, dispatch] = useReducer(profileAssetsReducer, {
        faydaId: {
            exists: false,
            data: null,
            uploadStatus: 'idle',
        },
        kebeleId: {
            exists: false,
            data: null,
            uploadStatus: 'idle',
        },
        isLoading: false,
        error: null,
    });

    // ===== Actions =====

    /**
     * Fetch ID data from backend
     */
    const fetchIdData = useCallback(async () => {
        dispatch({ type: profileAssetsActions.FETCH_ID_DATA_START });
        try {
            const data = await getIDData();
            dispatch({
                type: profileAssetsActions.FETCH_ID_DATA_SUCCESS,
                payload: data
            });
        } catch (error) {
            dispatch({
                type: profileAssetsActions.FETCH_ID_DATA_FAILURE,
                payload: error.message || 'Failed to fetch ID data'
            });
        }
    }, []);

    /**
     * Upload Fayda ID
     * @param {File} file - ID image file
     */
    const uploadFaydaId = useCallback(async (file) => {
        dispatch({ type: profileAssetsActions.UPLOAD_FAYDA_START });
        try {
            const data = await uploadFaydaID(file);
            dispatch({
                type: profileAssetsActions.UPLOAD_FAYDA_SUCCESS,
                payload: data
            });
            return data;
        } catch (error) {
            dispatch({
                type: profileAssetsActions.UPLOAD_FAYDA_FAILURE,
                payload: error.message || 'Failed to upload Fayda ID'
            });
            throw error;
        }
    }, []);

    /**
     * Upload Kebele ID
     * @param {File} file - ID image file
     */
    const uploadKebeleId = useCallback(async (file) => {
        dispatch({ type: profileAssetsActions.UPLOAD_KEBELE_START });
        try {
            const data = await uploadKebeleID(file);
            dispatch({
                type: profileAssetsActions.UPLOAD_KEBELE_SUCCESS,
                payload: data
            });
            return data;
        } catch (error) {
            dispatch({
                type: profileAssetsActions.UPLOAD_KEBELE_FAILURE,
                payload: error.message || 'Failed to upload Kebele ID'
            });
            throw error;
        }
    }, []);

    /**
     * Delete ID information (Right to be Forgotten)
     * @param {string} idType - 'fayda', 'kebele', or 'both'
     */
    const deleteId = useCallback(async (idType) => {
        dispatch({ type: profileAssetsActions.DELETE_ID_START });
        try {
            await deleteIDInfo(idType);
            dispatch({
                type: profileAssetsActions.DELETE_ID_SUCCESS,
                payload: { idType }
            });
        } catch (error) {
            dispatch({
                type: profileAssetsActions.DELETE_ID_FAILURE,
                payload: error.message || 'Failed to delete ID information'
            });
            throw error;
        }
    }, []);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        dispatch({ type: profileAssetsActions.CLEAR_ERROR });
    }, []);

    // ===== Derived State =====

    /**
     * Check if Fayda ID exists
     */
    const hasFaydaId = useMemo(
        () => state.faydaId.exists,
        [state.faydaId.exists]
    );

    /**
     * Check if Kebele ID exists
     */
    const hasKebeleId = useMemo(
        () => state.kebeleId.exists,
        [state.kebeleId.exists]
    );

    /**
     * Check if both IDs exist
     */
    const hasBothIds = useMemo(
        () => state.faydaId.exists && state.kebeleId.exists,
        [state.faydaId.exists, state.kebeleId.exists]
    );

    /**
     * Check if user can submit applications (based on ID requirements)
     * Note: This is derived from backend state, not a UI assumption
     */
    const canSubmitApplications = useMemo(
        () => state.faydaId.exists && state.kebeleId.exists,
        [state.faydaId.exists, state.kebeleId.exists]
    );

    /**
     * Check if any upload is in progress
     */
    const isUploading = useMemo(
        () => state.faydaId.uploadStatus === 'uploading' || state.kebeleId.uploadStatus === 'uploading',
        [state.faydaId.uploadStatus, state.kebeleId.uploadStatus]
    );

    /**
     * Get upload status summary
     */
    const uploadStatus = useMemo(
        () => ({
            fayda: state.faydaId.uploadStatus,
            kebele: state.kebeleId.uploadStatus,
            isUploading,
        }),
        [state.faydaId.uploadStatus, state.kebeleId.uploadStatus, isUploading]
    );

    // ===== Return API =====

    return {
        // State
        faydaId: state.faydaId,
        kebeleId: state.kebeleId,
        isLoading: state.isLoading,
        error: state.error,

        // Derived values
        hasFaydaId,
        hasKebeleId,
        hasBothIds,
        canSubmitApplications,
        isUploading,
        uploadStatus,

        // Actions
        fetchIdData,
        uploadFaydaId,
        uploadKebeleId,
        deleteId,
        clearError,
    };
};
