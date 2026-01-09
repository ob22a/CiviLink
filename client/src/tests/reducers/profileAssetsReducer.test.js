import { describe, it, expect } from 'vitest';
import { profileAssetsReducer, profileAssetsActions } from '../../reducers/profileAssetsReducer';

describe('profileAssetsReducer', () => {
    const initialState = {
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
    };

    it('should handle FETCH_ID_DATA_SUCCESS with both IDs', () => {
        const mockPayload = {
            faydaData: { fullName: 'User A' },
            kebeleData: { fullName: 'User B' }
        };
        const action = { type: profileAssetsActions.FETCH_ID_DATA_SUCCESS, payload: mockPayload };
        const state = profileAssetsReducer(initialState, action);
        expect(state.faydaId.exists).toBe(true);
        expect(state.kebeleId.exists).toBe(true);
        expect(state.faydaId.data.fullName).toBe('User A');
    });

    it('should handle UPLOAD_FAYDA_START', () => {
        const action = { type: profileAssetsActions.UPLOAD_FAYDA_START };
        const state = profileAssetsReducer(initialState, action);
        expect(state.faydaId.uploadStatus).toBe('uploading');
    });

    it('should handle DELETE_ID_SUCCESS for fayda', () => {
        const startState = {
            ...initialState,
            faydaId: { exists: true, data: {}, uploadStatus: 'success' }
        };
        const action = { type: profileAssetsActions.DELETE_ID_SUCCESS, payload: { idType: 'fayda' } };
        const state = profileAssetsReducer(startState, action);
        expect(state.faydaId.exists).toBe(false);
        expect(state.faydaId.uploadStatus).toBe('idle');
    });

    it('should handle DELETE_ID_SUCCESS for both', () => {
        const startState = {
            ...initialState,
            faydaId: { exists: true, data: {}, uploadStatus: 'success' },
            kebeleId: { exists: true, data: {}, uploadStatus: 'success' }
        };
        const action = { type: profileAssetsActions.DELETE_ID_SUCCESS, payload: { idType: 'both' } };
        const state = profileAssetsReducer(startState, action)
        expect(state.faydaId.exists).toBe(false);
        expect(state.kebeleId.exists).toBe(false);
    });
});
