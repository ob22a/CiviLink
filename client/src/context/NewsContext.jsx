import React, { createContext, useContext, useState, useCallback } from 'react';
import * as newsAPI from '../api/news.api';

const NewsContext = createContext(null);

export const useNews = () => {
    const context = useContext(NewsContext);
    if (!context) {
        throw new Error('useNews must be used within a NewsProvider');
    }
    return context;
};

export const NewsProvider = ({ children }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastFetched, setLastFetched] = useState(null);
    const [error, setError] = useState(null);

    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    const fetchNews = useCallback(async (force = false) => {
        const now = Date.now();

        // Return cached news if they exist and are not stale (unless forced)
        if (!force && news.length > 0 && lastFetched && (now - lastFetched < CACHE_TTL)) {
            return { success: true, data: news };
        }

        // Avoid multiple simultaneous fetches
        if (loading) return;

        setLoading(true);
        setError(null);
        try {
            const response = await newsAPI.getLatestNews();
            if (response.success) {
                const freshNews = response.data || [];
                setNews(freshNews);
                setLastFetched(now);
                return { success: true, data: freshNews };
            } else {
                throw new Error(response.message || 'Failed to fetch news');
            }
        } catch (err) {
            console.error('NewsContext fetch error:', err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [news, lastFetched, loading]);

    const value = {
        news,
        loading,
        error,
        fetchNews,
        hasInitialData: lastFetched !== null
    };

    return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};
