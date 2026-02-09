import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext.jsx';

/**
 * useChat Hook
 * 
 * Consumes the ChatContext.
 * Provides central access to conversations, messaging, and support inquiries.
 */
export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
