import { useContext } from 'react';
import { ProfileAssetsContext } from '../context/ProfileAssetsContext.jsx';

/**
 * useProfileAssets Hook
 * 
 * Consumes the ProfileAssetsContext.
 * Provides central access to user ID assets, upload status, and operations.
 */
export const useProfileAssets = () => {
    const context = useContext(ProfileAssetsContext);
    if (!context) {
        throw new Error('useProfileAssets must be used within a ProfileAssetsProvider');
    }
    return context;
};
