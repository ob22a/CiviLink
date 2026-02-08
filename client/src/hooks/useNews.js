import { useContext } from 'react';
import { NewsContext } from '../context/NewsContext.jsx';

/**
 * useNews Hook
 * 
 * Consumes the NewsContext.
 * Provides central access to the news cache and fetching logic.
 */
export const useNews = () => {
    const context = useContext(NewsContext);
    if (!context) {
        throw new Error('useNews must be used within a NewsProvider');
    }
    return context;
};
