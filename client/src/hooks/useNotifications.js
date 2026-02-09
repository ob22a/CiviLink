import { useContext } from 'react';
import { NotificationsContext } from '../context/NotificationsContext.jsx';

/**
 * useNotifications Hook
 * 
 * Consumes the NotificationsContext.
 * Provides central access to real-time notification state and dismissal logic.
 */
export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
};
