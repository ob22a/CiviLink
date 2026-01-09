import React, { useState, useEffect, useCallback } from 'react';
import * as newsAPI from '../../api/news.api';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';
import { usePermissions } from '../../hooks/usePermissions';
import '../../styles/officer/NewsManagement.css';

const OfficerNewsManagement = () => {
    const { canWriteNews } = usePermissions();
    const [newsList, setNewsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentNews, setCurrentNews] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '', headerImageUrl: '' });
    const [uploading, setUploading] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

    const fetchNews = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await newsAPI.getLatestNews();
            if (response.success) {
                setNewsList(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (canWriteNews) {
            fetchNews();
        }
    }, [canWriteNews, fetchNews]);

    const handleOpenModal = (news = null) => {
        if (news) {
            setCurrentNews(news);
            setFormData({ title: news.title, content: news.content, headerImageUrl: news.headerImageUrl || '' });
            setImagePreviewUrl(null);
        } else {
            setCurrentNews(null);
            setFormData({ title: '', content: '', headerImageUrl: '' });
            setImagePreviewUrl(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        // Clean up preview URL if exists
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
            setImagePreviewUrl(null);
        }
        setShowModal(false);
        setCurrentNews(null);
        setFormData({ title: '', content: '', headerImageUrl: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Clean up previous preview URL
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
        }

        // Create preview URL immediately
        const previewUrl = URL.createObjectURL(file);
        setImagePreviewUrl(previewUrl);

        setUploading(true);
        try {
            // 1. Get signed URL and storage path from backend
            const response = await newsAPI.requestUploadUrl(file.name);

            // Backend returns { uploadUrl, publicStoragePath } directly
            const { uploadUrl, publicStoragePath } = response;
            
            if (!uploadUrl || !publicStoragePath) {
                throw new Error('Failed to get upload URL - invalid response');
            }

            // 2. Upload file directly to Supabase using the signed URL
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image to storage');
            }

            // 3. Store the remote storage path, not the public URL
            setFormData(prev => ({ ...prev, headerImageUrl: publicStoragePath }));
            
        } catch (error) {
            console.error('Upload failed:', error);
            alert(`Upload failed: ${error.message}`);
            // Clean up preview on error
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
                setImagePreviewUrl(null);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentNews) {
                await newsAPI.editNews(currentNews._id, formData);
            } else {
                await newsAPI.createNews(formData);
            }
            handleCloseModal();
            fetchNews();
        } catch (error) {
            console.error('Failed to save news:', error);
            alert('Failed to save news article');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this news article?')) {
            try {
                await newsAPI.deleteNews(id);
                fetchNews();
            } catch (error) {
                console.error('Delete failed:', error);
                alert('Failed to delete news article');
            }
        }
    };

    if (!canWriteNews) {
        return (
            <AuthenticatedLayout>
                <div className="error-container">
                    <h1>Access Denied</h1>
                    <p>You do not have permission to manage news.</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout showSidebar={true}>
            <div className="news-management-page">
                <div className="news-management-header">
                    <h1>Manage News Announcements</h1>
                    <button className="create-news-btn" onClick={() => handleOpenModal()}>
                        <i className="fas fa-plus"></i> Create Article
                    </button>
                </div>

                {isLoading ? (
                    <div className="loading-state">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading news articles...</p>
                    </div>
                ) : newsList.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-newspaper"></i>
                        <p>No news articles found. Create your first one!</p>
                    </div>
                ) : (
                    <div className="news-list-grid">
                        {newsList.map(news => (
                            <div key={news._id} className="news-item-card">
                                <div className="news-item-image">
                                    {news.fullImageUrl ? (
                                        <img src={news.fullImageUrl} alt={news.title} />
                                    ) : (
                                        <div className="news-item-placeholder">
                                            <i className="fas fa-image"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="news-item-body">
                                    <h3>{news.title}</h3>
                                    <p>{news.content}</p>
                                </div>
                                <div className="news-item-footer">
                                    <button className="edit-btn" onClick={() => handleOpenModal(news)}>
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDelete(news._id)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showModal && (
                    <div className="news-modal-overlay">
                        <div className="news-modal-content">
                            <div className="news-modal-header">
                                <h2>{currentNews ? 'Edit News Article' : 'Create News Article'}</h2>
                                <button className="close-modal" onClick={handleCloseModal}>&times;</button>
                            </div>
                            <form className="news-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Article Title"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Content</label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Write article content here..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Header Image</label>
                                    <div className="image-upload-area" onClick={() => document.getElementById('newsImageInput').click()}>
                                        <i className="fas fa-cloud-upload-alt"></i>
                                        <p>{uploading ? 'Uploading...' : 'Click to upload image'}</p>
                                        <input
                                            type="file"
                                            id="newsImageInput"
                                            hidden
                                            onChange={handleFileUpload}
                                            accept="image/*"
                                        />
                                    </div>
                                    {imagePreviewUrl && (
                                        <img src={imagePreviewUrl} alt="Preview" className="image-preview" />
                                    )}
                                    {!imagePreviewUrl && currentNews && currentNews.fullImageUrl && (
                                        <img src={currentNews.fullImageUrl} alt="Current" className="image-preview" />
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="cancel-modal" onClick={handleCloseModal}>Cancel</button>
                                    <button type="submit" className="save-news-btn" disabled={uploading}>
                                        {currentNews ? 'Update' : 'Publish'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default OfficerNewsManagement;
