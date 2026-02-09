import { useContext } from 'react';
import { ApplicationContext } from '../context/ApplicationContext.jsx';

/**
 * useApplication Hook
 * 
 * Consumes the ApplicationContext.
 * Provides central access to application list, details, and submission logic.
 */
export const useApplication = () => {
    const context = useContext(ApplicationContext);
    if (!context) {
        throw new Error('useApplication must be used within an ApplicationProvider');
    }
    return context;
};
