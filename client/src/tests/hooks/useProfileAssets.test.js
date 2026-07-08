import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProfileAssets } from '../../hooks/useProfileAssets';
import { ProfileAssetsProvider } from '../../context/ProfileAssetsContext';
import * as api from '../../api/idUpload.api';

vi.mock('../../api/idUpload.api', () => ({
    uploadFaydaID: vi.fn(),
    uploadKebeleID: vi.fn(),
    deleteIDInfo: vi.fn(),
    getIDUploadStatus: vi.fn(),
}));

describe('useProfileAssets Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const wrapper = ({ children }) => React.createElement(ProfileAssetsProvider, null, children);

    it('should initialize with initial state', () => {
        const { result } = renderHook(() => useProfileAssets(), { wrapper });
        expect(result.current.isLoading).toBe(false);
        expect(result.current.faydaId.exists).toBe(false);
    });

    it('should fetch ID data successfully', async () => {
        const mockData = {
            success: true,
            data: {
                fayda: { fullName: 'Fayda User' },
                kebele: null
            }
        };
        vi.mocked(api.getIDUploadStatus).mockResolvedValue(mockData);

        const { result } = renderHook(() => useProfileAssets(), { wrapper });

        await act(async () => {
            await result.current.fetchIdData();
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

        const { result } = renderHook(() => useProfileAssets(), { wrapper });

        await act(async () => {
            await result.current.uploadFayda({ name: 'fayda.jpg' });
        });

        await waitFor(() => {
            expect(result.current.faydaId.uploadStatus).toBe('success');
            expect(result.current.faydaId.exists).toBe(true);
        });
    });

    it('should delete ID successfully', async () => {
        vi.mocked(api.deleteIDInfo).mockResolvedValue({ success: true });

        const { result } = renderHook(() => useProfileAssets(), { wrapper });

        await act(async () => {
            await result.current.deleteId('fayda');
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(api.deleteIDInfo).toHaveBeenCalledWith('fayda');
    });
});
