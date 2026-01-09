import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProfileAssets } from '../../hooks/useProfileAssets';
import * as api from '../../api/idUpload.api';
import * as userApi from '../../api/user.api';

vi.mock('../../api/idUpload.api', () => ({
    uploadFaydaID: vi.fn(),
    uploadKebeleID: vi.fn(),
    deleteIDInfo: vi.fn(),
}));

vi.mock('../../api/user.api', () => ({
    getIDData: vi.fn(),
    getUserProfile: vi.fn(),
    changePassword: vi.fn(),
}));

describe('useProfileAssets Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with initial state', () => {
        const { result } = renderHook(() => useProfileAssets());
        expect(result.current.isLoading).toBe(false);
        expect(result.current.faydaId.exists).toBe(false);
    });

    it('should fetch ID data successfully', async () => {
        const mockData = {
            success: true,
            data: {
                faydaData: { fullName: 'Fayda User' },
                kebeleData: null
            }
        };
        vi.mocked(userApi.getIDData).mockResolvedValue(mockData);

        const { result } = renderHook(() => useProfileAssets());

        await act(async () => {
            result.current.fetchIdData();
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.faydaId.exists).toBe(true);
            expect(result.current.kebeleId.exists).toBe(false);
        });
    });

    it('should upload Fayda successfully', async () => {
        const mockUpload = {
            success: true,
            data: { message: 'Success' }
        };
        vi.mocked(api.uploadFaydaID).mockResolvedValue(mockUpload);

        const { result } = renderHook(() => useProfileAssets());

        await act(async () => {
            result.current.uploadFaydaId({ name: 'fayda.jpg' });
        });

        await waitFor(() => {
            expect(result.current.faydaId.uploadStatus).toBe('success');
            expect(result.current.faydaId.exists).toBe(true);
        });
    });

    it('should delete ID successfully', async () => {
        vi.mocked(api.deleteIDInfo).mockResolvedValue({ success: true });

        const { result } = renderHook(() => useProfileAssets());

        await act(async () => {
            result.current.deleteId('fayda');
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(api.deleteIDInfo).toHaveBeenCalledWith('fayda');
    });
});
