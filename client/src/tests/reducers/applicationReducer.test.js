import { describe, it, expect } from 'vitest';
import { applicationReducer, applicationActions } from '../../reducers/applicationReducer';

describe('applicationReducer', () => {
    const initialState = {
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
    };

    it('should return the initial state', () => {
        expect(applicationReducer(undefined, {})).toEqual(initialState);
    });

    it('should handle FETCH_APPLICATIONS_START', () => {
        const action = { type: applicationActions.FETCH_APPLICATIONS_START };
        const state = applicationReducer(initialState, action);
        expect(state.isLoading).toBe(true);
        expect(state.error).toBe(null);
    });

    it('should handle FETCH_APPLICATIONS_SUCCESS', () => {
        const mockData = {
            data: [
                { _id: '1', category: 'TIN', status: 'pending' },
                { _id: '2', category: 'VITAL', status: 'approved' }
            ],
            pagination: {
                page: 1,
                totalPages: 2,
                total: 20,
                hasNextPage: true,
                hasPrevPage: false
            }
        };

        // The reducer extracts applications from data field or directly from payload
        const action = {
            type: applicationActions.FETCH_APPLICATIONS_SUCCESS,
            payload: { applications: mockData.data, pagination: mockData.pagination }
        };

        const state = applicationReducer(initialState, action);
        expect(state.isLoading).toBe(false);
        expect(state.applications).toHaveLength(2);
        expect(state.applications[0]._id).toBe('1');
        expect(state.pagination.total).toBe(20);
        expect(state.pagination.hasNextPage).toBe(true);
    });

    it('should handle FETCH_APPLICATIONS_SUCCESS with data as an array', () => {
        const mockPayload = {
            data: [{ _id: '1', category: 'TIN' }],
            pagination: { total: 1, totalPages: 1, page: 1 }
        };
        const action = { type: applicationActions.FETCH_APPLICATIONS_SUCCESS, payload: mockPayload };
        const state = applicationReducer(initialState, action);
        expect(state.applications).toHaveLength(1);
        expect(state.applications[0]._id).toBe('1');
    });

    it('should handle FETCH_APPLICATIONS_FAILURE', () => {
        const error = 'Failed to fetch';
        const action = { type: applicationActions.FETCH_APPLICATIONS_FAILURE, payload: error };
        const state = applicationReducer({ ...initialState, isLoading: true }, action);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(error);
    });

    it('should handle FETCH_APPLICATION_DETAILS_START', () => {
        const action = { type: applicationActions.FETCH_APPLICATION_DETAILS_START };
        const state = applicationReducer(initialState, action);
        expect(state.isLoading).toBe(true);
    });

    it('should handle FETCH_APPLICATION_DETAILS_SUCCESS', () => {
        const mockApp = { _id: '1', category: 'TIN', status: 'pending', formData: {} };
        const action = { type: applicationActions.FETCH_APPLICATION_DETAILS_SUCCESS, payload: mockApp };
        const state = applicationReducer({ ...initialState, isLoading: true }, action);
        expect(state.isLoading).toBe(false);
        expect(state.selectedApplication).toEqual(mockApp);
    });

    it('should handle SUBMIT_APPLICATION_START', () => {
        const action = { type: applicationActions.SUBMIT_APPLICATION_START };
        const state = applicationReducer(initialState, action);
        expect(state.isSubmitting).toBe(true);
    });

    it('should handle SUBMIT_APPLICATION_SUCCESS', () => {
        const newApp = { _id: '3', category: 'TIN', status: 'pending' };
        const action = {
            type: applicationActions.SUBMIT_APPLICATION_SUCCESS,
            payload: { application: newApp }
        };
        const state = applicationReducer({ ...initialState, isSubmitting: true, applications: [] }, action);
        expect(state.isSubmitting).toBe(false);
        expect(state.applications).toContainEqual(newApp);
    });

    it('should handle CLEAR_ERROR', () => {
        const action = { type: applicationActions.CLEAR_ERROR };
        const state = applicationReducer({ ...initialState, error: 'some error' }, action);
        expect(state.error).toBe(null);
    });

    it('should handle CLEAR_SELECTED', () => {
        const action = { type: applicationActions.CLEAR_SELECTED };
        const state = applicationReducer({ ...initialState, selectedApplication: { id: 1 } }, action);
        expect(state.selectedApplication).toBe(null);
    });
});
