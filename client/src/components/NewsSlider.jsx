import React, { useState, useEffect } from 'react';
import * as newsAPI from '../api/news.api';
import '../styles/components/NewsSlider.css';

const NewsSlider = () => {
    const [news, setNews] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await newsAPI.getLatestNews();
                if (response.success) {
                    setNews(response.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch news:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    useEffect(() => {
        if (news.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % news.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [news]);

    if (loading) return <div className="news-slider-loading">Loading latest news...</div>;
    if (news.length === 0) return null;

    return (
        <div className="news-slider">
            <div
                className="slider-container"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {news.map((item) => (
                    <div key={item._id} className="news-slide">
                        <div className="news-content">
                            <span className="news-tag">Announcement</span>
                            <h3>{item.title}</h3>
                            <p>{item.content}</p>
                            <button className="read-more">Learn More</button>
                        </div>
                        {item.fullImageUrl && (
                            <div className="news-image">
                                <img src={item.fullImageUrl} alt={item.title} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {news.length > 1 && (
                <div className="slider-dots">
                    {news.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                        ></span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsSlider;
