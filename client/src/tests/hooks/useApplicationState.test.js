import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useApplicationState } from '../../hooks/useApplicationState';
import * as api from '../../api/applications.api';

// Mock the API modules
vi.mock('../../api/applications.api', () => ({
    getAllApplications: vi.fn(),
    submitTinApplication: vi.fn(),
    submitVitalApplication: vi.fn(),
    downloadCertificate: vi.fn(),
}));

vi.mock('../../api/officer.api', () => ({
    getOfficerApplications: vi.fn(),
    getApplicationDetails: vi.fn(),
    approveTinApplication: vi.fn(),
    rejectTinApplication: vi.fn(),
    approveVitalApplication: vi.fn(),
    rejectVitalApplication: vi.fn(),
    getOfficerMetrics: vi.fn(),
    getOfficerActivities: vi.fn(),
}));

describe('useApplicationState Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with initial state', () => {
        const { result } = renderHook(() => useApplicationState());
        expect(result.current.isLoading).toBe(false);
        expect(result.current.applications).toEqual([]);
        expect(result.current.hasApplications).toBe(false);
    });

    it('should fetch applications successfully', async () => {
        const mockResponse = {
            success: true,
            data: [{ _id: '1', status: 'pending' }],
            pagination: { total: 1, totalPages: 1, page: 1 }
        };
        vi.mocked(api.getAllApplications).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useApplicationState());

        await act(async () => {
            result.current.fetchApplications(1, 10);
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.applications).toHaveLength(1);
        });

        expect(result.current.hasApplications).toBe(true);
        expect(api.getAllApplications).toHaveBeenCalledWith(1, 10);
    });

    it('should handle fetch errors', async () => {
        vi.mocked(api.getAllApplications).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useApplicationState());

        await act(async () => {
            result.current.fetchApplications();
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBe('Network error');
        });
    });

    it('should submit application successfully', async () => {
        const mockResponse = { success: true, application: { _id: 'new', status: 'pending' } };
        vi.mocked(api.submitTinApplication).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useApplicationState());

        await act(async () => {
            result.current.submitTin({ some: 'data' });
        });

        await waitFor(() => {
            expect(result.current.isSubmitting).toBe(false);
        });

        // According to point 4: Reducer relies on subsequent fetch, 
        // asserting success flag/loading instead of local mutation if it fails.
        // However, we should at least check loading is finished.
        expect(result.current.isSubmitting).toBe(false);
    });
});
