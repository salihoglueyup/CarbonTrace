import { useState, useEffect } from 'react'
import { marketAPI } from '../services/api'

const NewsFeed = () => {
    const [news, setNews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const data = await marketAPI.getNews(5)
                if (Array.isArray(data)) {
                    setNews(data)
                } else {
                    console.error('Data is not an array:', data)
                    setNews([])
                }
            } catch (err) {
                console.error('Failed to fetch news:', err)
                setNews([])
            } finally {
                setLoading(false)
            }
        }

        fetchNews()
    }, [])

    if (loading) {
        return (
            <div className="card h-100">
                <div className="card-header">
                    <span>📰 Sektörel Haberler</span>
                </div>
                <div className="card-body">
                    <div className="loading-skeleton">Haberler yükleniyor...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="card h-100 news-feed-card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <span>📰 Gündem & Mevzuat</span>
                <span className="badge-live">LIVE</span>
            </div>
            <div className="card-body p-0">
                <div className="news-list">
                    {news.map((item, index) => (
                        <div key={index} className="news-item">
                            {item.image && (
                                <div className="news-image" style={{ backgroundImage: `url(${item.image})` }}></div>
                            )}
                            <div className="news-content">
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-title">
                                    {item.title}
                                </a>
                                <div className="news-meta">
                                    <span className="news-source">{item.source}</span>
                                    <span className="news-date">{new Date(item.published).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {news.length === 0 && (
                        <div className="p-4 text-center text-muted">Ağ bağlantısı hatası veya güncel haber bulunamadı.</div>
                    )}
                </div>
            </div>

            <style>{`
                .news-feed-card {
                    overflow: hidden;
                }
                .badge-live {
                    background: #e53e3e;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    animation: pulse 2s infinite;
                }
                .news-list {
                    max-height: 400px;
                    overflow-y: auto;
                    scrollbar-width: thin;
                }
                .news-item {
                    padding: 1rem;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    gap: 1rem;
                    transition: background 0.2s;
                }
                .news-item:hover {
                    background: #f9fafb;
                }
                .news-image {
                    width: 60px;
                    height: 60px;
                    background-size: cover;
                    background-position: center;
                    border-radius: 8px;
                    flex-shrink: 0;
                    background-color: #eee;
                }
                .news-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .news-title {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #2d3748;
                    text-decoration: none;
                    margin-bottom: 0.25rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .news-title:hover {
                    color: #00874A;
                }
                .news-meta {
                    font-size: 0.75rem;
                    color: #718096;
                    display: flex;
                    gap: 0.5rem;
                }
                
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    )
}

export default NewsFeed
