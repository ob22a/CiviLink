import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/officer/MessageCenter.css';
import Footer from '../../components/Footer';
import Navigation2 from '../../components/Navigation2';
import OfficerSideBar from '../../components/OfficerSideBar';
import { useChat } from '../../auth/ChatContext.jsx';

const MessageCenter = () => {
    const navigate = useNavigate();
    const {
        conversations,
        isLoading,
        error,
        fetchConversations,
        sendMessage,
        markAsRead,
        isSending
    } = useChat();

    const [viewModal, setViewModal] = useState({
        open: false,
        message: null
    });
    const [messages, setMessages] = useState([]);

    // Fetch conversations from backend
    useEffect(() => {
        fetchConversations(1, 100);
    }, [fetchConversations]);

    // Map backend conversations to the UI expected format
    useEffect(() => {
        const mappedMessages = (conversations || []).map(conv => ({
            id: conv._id,
            applicationId: conv.applicationId || 'N/A',
            applicationType: conv.applicationType || 'General Inquiry',
            applicantName: (conv.citizenId?.fullName || conv.guestName) || 'Anonymous',
            applicantEmail: (conv.citizenId?.email || conv.guestEmail) || '',
            subject: conv.subject || 'No Subject',
            message: conv.citizenMessage || 'No message content',
            status: conv.status === 'pending' ? 'unread' : conv.status === 'open' ? 'read' : 'replied',
            receivedDate: new Date(conv.createdAt).toISOString().split('T')[0],
            receivedTime: new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: conv.category || 'general'
        }));
        setMessages(mappedMessages);
    }, [conversations]);

    const [filters, setFilters] = useState({
        status: 'all',
        category: 'all',
        dateRange: 'all'
    });

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Selected messages for batch operations
    const [selectedMessages, setSelectedMessages] = useState([]);

    // Reply modal state
    const [replyModal, setReplyModal] = useState({
        open: false,
        messageId: null,
        applicantEmail: '',
        subject: '',
        replyText: ''
    });

    // Template modal state
    const [templateModal, setTemplateModal] = useState({
        open: false,
        selectedTemplate: ''
    });

    // Statistics state
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        pending: 0,
        replied: 0
    });

    // Email templates
    const emailTemplates = [
        {
            id: 'template_acknowledgment',
            name: 'Application Acknowledgment',
            subject: 'Application Received - CiviLink Services',
            content: 'Dear Applicant,\n\nThank you for contacting CiviLink. We have received your message regarding your application.\n\nYour application is currently being processed. We will notify you once there are any updates.\n\nApplication Reference: [APPLICATION_ID]\n\nBest regards,\nCiviLink Support Team'
        },
        {
            id: 'template_doc_request',
            name: 'Document Request',
            subject: 'Additional Documents Required - CiviLink Services',
            content: 'Dear Applicant,\n\nWe require additional documents to process your application:\n\n1. [Document 1]\n2. [Document 2]\n3. [Document 3]\n\nPlease upload these documents through your CiviLink account within 7 days.\n\nApplication Reference: [APPLICATION_ID]\n\nBest regards,\nCiviLink Support Team'
        },
        {
            id: 'template_approval',
            name: 'Application Approved',
            subject: 'Application Approved - CiviLink Services',
            content: 'Dear Applicant,\n\nWe are pleased to inform you that your application has been approved.\n\nApplication Reference: [APPLICATION_ID]\nStatus: APPROVED\n\nYou can download your certificate from your CiviLink account.\n\nBest regards,\nCiviLink Support Team'
        },
        {
            id: 'template_rejection',
            name: 'Application Rejected',
            subject: 'Application Status Update - CiviLink Services',
            content: 'Dear Applicant,\n\nAfter careful review, we regret to inform you that your application has been rejected.\n\nApplication Reference: [APPLICATION_ID]\nStatus: REJECTED\nReason: [REASON_FOR_REJECTION]\n\nYou may reapply after addressing the mentioned issues.\n\nBest regards,\nCiviLink Support Team'
        },
        {
            id: 'template_general',
            name: 'General Response',
            subject: 'Regarding Your Inquiry - CiviLink Services',
            content: 'Dear Applicant,\n\nThank you for your inquiry.\n\n[ENTER YOUR RESPONSE HERE]\n\nIf you have any further questions, please don\'t hesitate to contact us.\n\nApplication Reference: [APPLICATION_ID]\n\nBest regards,\nCiviLink Support Team'
        }
    ];

    // Update statistics
    useEffect(() => {
        const total = filteredMessages.length;
        const unread = filteredMessages.filter(msg => msg.status === 'unread').length;
        const pending = filteredMessages.filter(msg => msg.status === 'pending').length;
        const replied = filteredMessages.filter(msg => msg.status === 'replied').length;

        setStats({ total, unread, pending, replied });
    }, [messages, filters, searchQuery]);

    // Filter messages
    const filteredMessages = messages.filter(msg => {
        // Search filter
        if (searchQuery &&
            !msg.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !msg.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !msg.applicationId.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Status filter
        if (filters.status !== 'all' && msg.status !== filters.status) {
            return false;
        }


        // Category filter
        if (filters.category !== 'all' && msg.category !== filters.category) {
            return false;
        }

        // Date range filter (simplified)
        if (filters.dateRange !== 'all') {
            const today = new Date();
            const msgDate = new Date(msg.receivedDate);
            const diffDays = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));

            if (filters.dateRange === 'today' && diffDays > 0) return false;
            if (filters.dateRange === 'week' && diffDays > 7) return false;
        }

        return true;
    });

    // Get status configuration
    const getStatusConfig = (status) => {
        const config = {
            unread: { label: 'Unread', color: '#ef4444', bg: '#fef2f2', icon: 'fa-envelope' },
            read: { label: 'Read', color: '#3b82f6', bg: '#eff6ff', icon: 'fa-envelope-open' },
            pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-clock' },
            replied: { label: 'Replied', color: '#10b981', bg: '#ecfdf5', icon: 'fa-reply' }
        };
        return config[status] || { label: status, color: '#6b7280', bg: '#f9fafb', icon: 'fa-question' };
    };


    // Get category configuration
    const getCategoryConfig = (category) => {
        const config = {
            urgent_inquiry: { label: 'Urgent Inquiry', color: '#ef4444', bg: '#fef2f2', icon: 'fa-exclamation' },
            status_inquiry: { label: 'Status Inquiry', color: '#3b82f6', bg: '#eff6ff', icon: 'fa-question-circle' },
            document_submission: { label: 'Document Submission', color: '#8b5cf6', bg: '#f5f3ff', icon: 'fa-file-upload' },
            withdrawal_request: { label: 'Withdrawal Request', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-undo' },
            payment_related: { label: 'Payment Related', color: '#10b981', bg: '#ecfdf5', icon: 'fa-credit-card' }
        };
        return config[category] || { label: 'General', color: '#6b7280', bg: '#f9fafb', icon: 'fa-envelope' };
    };

    // Handle message selection
    const handleSelectMessage = (msgId) => {
        setSelectedMessages(prev =>
            prev.includes(msgId)
                ? prev.filter(id => id !== msgId)
                : [...prev, msgId]
        );
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedMessages.length === filteredMessages.length) {
            setSelectedMessages([]);
        } else {
            setSelectedMessages(filteredMessages.map(msg => msg.id));
        }
    };

    // Handle mark as read
    const handleMarkAsRead = (msgId) => {
        markAsRead(msgId);
    };

    // Handle batch actions
    const handleBatchAction = (action) => {
        if (selectedMessages.length === 0) {
            alert('Please select messages first');
            return;
        }

        switch (action) {
            case 'mark_as_read':
                setMessages(prev => prev.map(msg =>
                    selectedMessages.includes(msg.id) ? { ...msg, status: 'read' } : msg
                ));
                alert(`Marked ${selectedMessages.length} message(s) as read`);
                break;
            case 'mark_as_replied':
                setMessages(prev => prev.map(msg =>
                    selectedMessages.includes(msg.id) ? { ...msg, status: 'replied' } : msg
                ));
                alert(`Marked ${selectedMessages.length} message(s) as replied`);
                break;
            case 'archive':
                // In a real app, this would move to archive
                setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg.id)));
                alert(`Archived ${selectedMessages.length} message(s)`);
                break;
        }

        setSelectedMessages([]);
    };

    // Open reply modal
    const handleOpenReply = (message) => {
        setReplyModal({
            open: true,
            messageId: message.id,
            applicantEmail: message.applicantEmail,
            subject: `Re: ${message.subject}`,
            replyText: ''
        });

        // Mark as read when opening reply
        handleMarkAsRead(message.id);
    };

    // Close reply modal
    const handleCloseReply = () => {
        setReplyModal({
            open: false,
            messageId: null,
            applicantEmail: '',
            subject: '',
            replyText: ''
        });
    };

    // Send reply
    const handleSendReply = async () => {
        if (!replyModal.replyText.trim()) {
            alert('Please enter your reply message');
            return;
        }

        try {
            await sendMessage(replyModal.messageId, replyModal.replyText);
            alert(`Reply sent successfully`);
            handleCloseReply();
            // Refresh conversations to get updated status
            fetchConversations(1, 100);
        } catch (err) {
            console.error('Failed to send reply:', err);
            alert('Failed to send reply. Please try again.');
        }
    };

    // Open template modal
    const handleOpenTemplate = () => {
        setTemplateModal({
            open: true,
            selectedTemplate: ''
        });
    };

    // Apply template
    const handleApplyTemplate = () => {
        const template = emailTemplates.find(t => t.id === templateModal.selectedTemplate);
        if (template) {
            setReplyModal(prev => ({
                ...prev,
                subject: template.subject,
                replyText: template.content
            }));
        }
        setTemplateModal({ open: false, selectedTemplate: '' });
    };

    // Handle filter change
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    // Get unique categories
    const categories = [...new Set(messages.map(msg => msg.category))];


    // Open view message modal
    const handleViewMessage = (message) => {
        setViewModal({
            open: true,
            message
        });

        // Mark as read when viewing
        handleMarkAsRead(message.id);
    };

    // Close view message modal
    const handleCloseViewMessage = () => {
        setViewModal({
            open: false,
            message: null
        });
    };

    // Format message text with paragraphs
    const formatMessage = (text) => {
        return text.split('\n').map((line, index) => (
            <p key={index} className="message-paragraph">
                {line}
            </p>
        ));
    };

    return (
        <>
            <Navigation2 />
            <div className="message-center">
                <OfficerSideBar />
                <main className="main-content">
                    {/* Header */}
                    <div className="message-header">
                        <div className="header-left">
                            <h1><i className="fas fa-inbox"></i> Message Center</h1>
                            <p className="subtitle">Manage and respond to user inquiries</p>
                        </div>
                        <div className="header-right">
                            <div className="message-stats">
                                <div className="stat-item">
                                    <div className="stat-value">{stats.total}</div>
                                    <div className="stat-label">Total</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{stats.unread}</div>
                                    <div className="stat-label">Unread</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{stats.pending}</div>
                                    <div className="stat-label">Pending</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{stats.replied}</div>
                                    <div className="stat-label">Replied</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Quick Actions */}
                    <div className="message-controls">
                        <div className="search-container">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search messages by applicant, subject, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="quick-actions">
                            <button
                                className="action-btn compose"
                                onClick={() => navigate('/officer/compose-message')}
                            >
                                <i className="fas fa-pen"></i> Compose New
                            </button>
                            <button
                                className="action-btn template"
                                onClick={handleOpenTemplate}
                            >
                                <i className="fas fa-file-alt"></i> Use Template
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="message-filters">
                        <div className="filter-group">
                            <label>Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Status</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                                <option value="pending">Pending</option>
                                <option value="replied">Replied</option>
                            </select>
                        </div>


                        <div className="filter-group">
                            <label>Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => {
                                    const config = getCategoryConfig(category);
                                    return (
                                        <option key={category} value={category}>
                                            {config.label}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Date Range</label>
                            <select
                                value={filters.dateRange}
                                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                            </select>
                        </div>

                        <button
                            className="clear-filters-btn"
                            onClick={() => setFilters({
                                status: 'all',
                                category: 'all',
                                dateRange: 'all'
                            })}
                        >
                            <i className="fas fa-times"></i> Clear Filters
                        </button>
                    </div>

                    {/* Batch Actions */}
                    {selectedMessages.length > 0 && (
                        <div className="batch-actions-bar">
                            <div className="batch-info">
                                <i className="fas fa-check-circle"></i>
                                <span>{selectedMessages.length} message(s) selected</span>
                            </div>
                            <div className="batch-buttons">
                                <button
                                    className="batch-btn read"
                                    onClick={() => handleBatchAction('mark_as_read')}
                                >
                                    <i className="fas fa-envelope-open"></i> Mark as Read
                                </button>
                                <button
                                    className="batch-btn replied"
                                    onClick={() => handleBatchAction('mark_as_replied')}
                                >
                                    <i className="fas fa-reply"></i> Mark as Replied
                                </button>
                                <button
                                    className="batch-btn archive"
                                    onClick={() => handleBatchAction('archive')}
                                >
                                    <i className="fas fa-archive"></i> Archive
                                </button>
                                <button
                                    className="batch-btn clear"
                                    onClick={() => setSelectedMessages([])}
                                >
                                    <i className="fas fa-times"></i> Clear Selection
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Messages List */}
                    <div className="messages-list">
                        {filteredMessages.length === 0 ? (
                            <div className="no-messages">
                                <i className="fas fa-inbox"></i>
                                <h3>No messages found</h3>
                                <p>Try adjusting your filters or search query</p>
                            </div>
                        ) : (
                            filteredMessages.map((msg) => {
                                const statusConfig = getStatusConfig(msg.status);
                                const categoryConfig = getCategoryConfig(msg.category);

                                return (
                                    <div
                                        key={msg.id}
                                        className={`message-item ${msg.status === 'unread' ? 'unread' : ''}`}
                                        onClick={() => handleMarkAsRead(msg.id)}
                                    >
                                        <div className="message-select">
                                            <input
                                                type="checkbox"
                                                checked={selectedMessages.includes(msg.id)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectMessage(msg.id);
                                                }}
                                            />
                                        </div>


                                        <div className="message-sender">
                                            <div className="sender-avatar">
                                                {msg.applicantName.charAt(0)}
                                            </div>
                                            <div className="sender-info">
                                                <div className="sender-name">{msg.applicantName}</div>
                                                <div className="sender-email">{msg.applicantEmail}</div>
                                            </div>
                                        </div>

                                        <div className="message-content">
                                            <div className="message-subject">
                                                <strong>{msg.subject}</strong>
                                                <span
                                                    className="category-badge"
                                                    style={{
                                                        color: categoryConfig.color,
                                                        backgroundColor: categoryConfig.bg
                                                    }}
                                                >
                                                    <i className={`fas ${categoryConfig.icon}`}></i>
                                                    {categoryConfig.label}
                                                </span>
                                            </div>
                                            <div className="message-preview">
                                                {msg.message.substring(0, 100)}...
                                            </div>
                                            <div className="message-meta">
                                                <span className="application-ref">
                                                    <i className="fas fa-file-alt"></i>
                                                    {msg.applicationId} ({msg.applicationType})
                                                </span>
                                                <span className="message-date">
                                                    <i className="fas fa-clock"></i>
                                                    {msg.receivedDate} at {msg.receivedTime}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="message-status">
                                            <span
                                                className="status-badge"
                                                style={{
                                                    color: statusConfig.color,
                                                    backgroundColor: statusConfig.bg
                                                }}
                                            >
                                                <i className={`fas ${statusConfig.icon}`}></i>
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        <div className="message-actions">
                                            <button
                                                className="action-btn view"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewMessage(msg);
                                                }}
                                                title="View Message"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button
                                                className="action-btn reply"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenReply(msg);
                                                }}
                                                title="Reply"
                                            >
                                                <i className="fas fa-reply"></i>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Summary Stats */}
                    <div className="summary-cards">
                        <div className="summary-card">
                            <div className="summary-icon">
                                <i className="fas fa-clock"></i>
                            </div>
                            <div className="summary-content">
                                <h4>Average Response Time</h4>
                                <div className="summary-value">24 hours</div>
                                <div className="summary-trend">
                                    <i className="fas fa-arrow-down trend-down"></i>
                                    <span>2 hours faster than last week</span>
                                </div>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="summary-icon">
                                <i className="fas fa-user-check"></i>
                            </div>
                            <div className="summary-content">
                                <h4>Satisfaction Rate</h4>
                                <div className="summary-value">94%</div>
                                <div className="summary-trend">
                                    <i className="fas fa-arrow-up trend-up"></i>
                                    <span>+3% from last month</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Reply Modal */}
            {replyModal.open && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3><i className="fas fa-reply"></i> Reply to Applicant</h3>
                            <button className="modal-close" onClick={handleCloseReply}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>To</label>
                                <div className="email-display">{replyModal.applicantEmail}</div>
                            </div>

                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    value={replyModal.subject}
                                    onChange={(e) => setReplyModal(prev => ({ ...prev, subject: e.target.value }))}
                                    className="subject-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Your Reply</label>
                                <textarea
                                    value={replyModal.replyText}
                                    onChange={(e) => setReplyModal(prev => ({ ...prev, replyText: e.target.value }))}
                                    className="reply-textarea"
                                    rows="10"
                                    placeholder="Type your response here..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Templates</label>
                                <select
                                    value={templateModal.selectedTemplate}
                                    onChange={(e) => setTemplateModal(prev => ({ ...prev, selectedTemplate: e.target.value }))}
                                    className="template-select"
                                >
                                    <option value="">Select a template...</option>
                                    {emailTemplates.map(template => (
                                        <option key={template.id} value={template.id}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                                {templateModal.selectedTemplate && (
                                    <button className="apply-template-btn" onClick={handleApplyTemplate}>
                                        Apply Template
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={handleCloseReply}>
                                Cancel
                            </button>
                            <button className="btn-send" onClick={handleSendReply}>
                                <i className="fas fa-paper-plane"></i> Send Email
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Template Modal */}
            {templateModal.open && (
                <div className="modal-overlay">
                    <div className="modal-content template-modal">
                        <div className="modal-header">
                            <h3><i className="fas fa-file-alt"></i> Select Email Template</h3>
                            <button className="modal-close" onClick={() => setTemplateModal({ open: false, selectedTemplate: '' })}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="templates-list">
                                {emailTemplates.map(template => (
                                    <div
                                        key={template.id}
                                        className={`template-item ${templateModal.selectedTemplate === template.id ? 'selected' : ''}`}
                                        onClick={() => setTemplateModal(prev => ({ ...prev, selectedTemplate: template.id }))}
                                    >
                                        <div className="template-icon">
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <div className="template-info">
                                            <h4>{template.name}</h4>
                                            <p className="template-subject">{template.subject}</p>
                                            <p className="template-preview">
                                                {template.content.substring(0, 80)}...
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setTemplateModal({ open: false, selectedTemplate: '' })}>
                                Cancel
                            </button>
                            <button className="btn-apply" onClick={handleApplyTemplate}>
                                Apply Template
                            </button>
                        </div>
                    </div>
                </div>


            )}

            {/* View Message Modal - Add this before the Reply Modal */}
            {viewModal.open && viewModal.message && (
                <div className="modal-overlay">
                    <div className="modal-content view-message-modal">
                        <div className="modal-header">
                            <div className="modal-header-content">
                                <h3>
                                    <i className="fas fa-envelope"></i>
                                    Message from {viewModal.message.applicantName}
                                </h3>
                                <div className="message-meta-header">
                                    <span className="application-ref">
                                        <i className="fas fa-file-alt"></i>
                                        {viewModal.message.applicationId}
                                    </span>
                                    <span className="message-date">
                                        <i className="fas fa-clock"></i>
                                        {viewModal.message.receivedDate} at {viewModal.message.receivedTime}
                                    </span>
                                </div>
                            </div>
                            <button className="modal-close" onClick={handleCloseViewMessage}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="message-sender-info">
                                <div className="sender-avatar-large">
                                    {viewModal.message.applicantName.charAt(0)}
                                </div>
                                <div className="sender-details">
                                    <h4>{viewModal.message.applicantName}</h4>
                                    <p className="sender-email">{viewModal.message.applicantEmail}</p>
                                </div>
                            </div>

                            <div className="message-subject-full">
                                <strong>Subject: </strong>
                                {viewModal.message.subject}
                            </div>

                            <div className="message-category">
                                <span
                                    className="category-badge"
                                    style={{
                                        color: getCategoryConfig(viewModal.message.category).color,
                                        backgroundColor: getCategoryConfig(viewModal.message.category).bg
                                    }}
                                >
                                    <i className={`fas ${getCategoryConfig(viewModal.message.category).icon}`}></i>
                                    {getCategoryConfig(viewModal.message.category).label}
                                </span>
                            </div>

                            <div className="message-content-full">
                                <div className="message-text">
                                    {formatMessage(viewModal.message.message)}
                                </div>
                            </div>

                            <div className="application-info">
                                <h4>Application Details</h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Application Type:</span>
                                        <span className="info-value">{viewModal.message.applicationType}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Reference ID:</span>
                                        <span className="info-value">{viewModal.message.applicationId}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Status:</span>
                                        <span
                                            className="status-badge"
                                            style={{
                                                color: getStatusConfig(viewModal.message.status).color,
                                                backgroundColor: getStatusConfig(viewModal.message.status).bg
                                            }}
                                        >
                                            <i className={`fas ${getStatusConfig(viewModal.message.status).icon}`}></i>
                                            {getStatusConfig(viewModal.message.status).label}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Received:</span>
                                        <span className="info-value">{viewModal.message.receivedDate} at {viewModal.message.receivedTime}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={handleCloseViewMessage}>
                                Close
                            </button>
                            <button
                                className="btn-send"
                                onClick={() => {
                                    handleCloseViewMessage();
                                    handleOpenReply(viewModal.message);
                                }}
                            >
                                <i className="fas fa-reply"></i> Reply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}

export default MessageCenter;