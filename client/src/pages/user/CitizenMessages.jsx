import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useChat } from '../../auth/ChatContext.jsx';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout.jsx';
import '../../styles/user/CitizenMessages.css';

function CitizenMessages() {
    const { user } = useAuth();
    const { conversations, isLoading, error, fetchCitizenConversations: fetchConversations } = useChat();
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const handleSelectConversation = (id) => {
        setSelectedId(selectedId === id ? null : id);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <AuthenticatedLayout>
            <div className="citizen-messages-container">
                <div className="messages-header">
                    <h1><i className="fas fa-envelope"></i> My Support Inquiries</h1>
                    <p>Track your conversations with our support officers.</p>
                </div>

                {isLoading ? (
                    <div className="messages-loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading your messages...</p>
                    </div>
                ) : error ? (
                    <div className="messages-error">
                        <i className="fas fa-exclamation-circle"></i>
                        <p>{error}</p>
                        <button onClick={fetchConversations} className="retry-btn">Retry</button>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="messages-empty">
                        <i className="fas fa-inbox"></i>
                        <h3>No messages found</h3>
                        <p>You haven't submitted any support inquiries yet.</p>
                        <a href="/help" className="contact-link">Contact Support</a>
                    </div>
                ) : (
                    <div className="conversations-list">
                        {conversations.map((conv) => (
                            <div
                                key={conv._id}
                                className={`conversation-card ${selectedId === conv._id ? 'expanded' : ''} ${conv.status === 'closed' ? 'closed' : 'open'}`}
                                onClick={() => handleSelectConversation(conv._id)}
                            >
                                <div className="card-header">
                                    <div className="status-indicator">
                                        <span className={`status-badge ${conv.status}`}>
                                            {conv.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="header-content">
                                        <h3>{conv.subject}</h3>
                                        <p className="meta-info">
                                            <span><i className="fas fa-clock"></i> {formatDate(conv.createdAt)}</span>
                                            {conv.officerId && (
                                                <span><i className="fas fa-user-tie"></i> Officer: {conv.officerId.fullName}</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="expand-icon">
                                        <i className={`fas fa-chevron-${selectedId === conv._id ? 'up' : 'down'}`}></i>
                                    </div>
                                </div>

                                {selectedId === conv._id && (
                                    <div className="card-body">
                                        <div className="message-thread">
                                            <div className="message-item citizen">
                                                <div className="message-bubble">
                                                    <p className="sender-tag">Your Message</p>
                                                    <p className="message-text">{conv.citizenMessage}</p>
                                                </div>
                                            </div>

                                            {conv.officerMessage ? (
                                                <div className="message-item officer">
                                                    <div className="message-bubble">
                                                        <p className="sender-tag">Officer Response</p>
                                                        <p className="message-text">{conv.officerMessage}</p>
                                                        <p className="timestamp">{formatDate(conv.updatedAt)}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="message-item pending">
                                                    <p><i className="fas fa-hourglass-half"></i> Waiting for officer response...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

export default CitizenMessages;
