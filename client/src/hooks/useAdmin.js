import { useState, useCallback } from 'react';
import {
    getPerformanceMetrics,
    getOfficerPerformance,
    getSecurityLogs,
    assignOfficer,
    exportPerformanceReport,
    exportSecurityLogs,
    downloadSecurityLog,
    searchUser
} from '../api/admin.api';

export const useAdmin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [metrics, logs, officerStats] = await Promise.all([
                getPerformanceMetrics(),
                getSecurityLogs({ limit: 5 }),
                getOfficerPerformance({ limit: 1 })
            ]);
            return { metrics, logs, officerStats };
        } catch (err) {
            setError(err.message || 'Failed to fetch dashboard data');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPerformanceData = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const [metrics, officers] = await Promise.all([
                getPerformanceMetrics(params),
                getOfficerPerformance(params)
            ]);
            return { metrics, officers };
        } catch (err) {
            setError(err.message || 'Failed to fetch performance data');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOfficerList = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getOfficerPerformance(params);
            // Strict Schema: returns { data: { docs: [], ... } }
            // We return the array for the list view
            // Return full pagination data and counts, not just docs
            return response.data || { docs: [] };
        } catch (err) {
            setError(err.message || 'Failed to fetch officers');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSecurityLogs = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        try {
            return await getSecurityLogs(params);
        } catch (err) {
            setError(err.message || 'Failed to fetch security logs');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const promoteUser = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            return await assignOfficer(data);
        } catch (err) {
            setError(err.message || 'Failed to promote user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        fetchDashboardData,
        fetchPerformanceData,
        fetchOfficerList,
        fetchSecurityLogs,
        promoteUser,
        exportPerformanceReport,
        exportSecurityLogs,
        downloadSecurityLog,
        searchUser
    };
};
