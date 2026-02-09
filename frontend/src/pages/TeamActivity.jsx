import { useState } from 'react'

const TeamActivity = () => {
    const [activeTab, setActiveTab] = useState('activity')
    const [newComment, setNewComment] = useState('')

    const teamMembers = [
        { id: 1, name: 'Ahmet Yılmaz', role: 'Admin', avatar: 'AY', status: 'online', lastActive: 'Şimdi' },
        { id: 2, name: 'Fatma Kaya', role: 'Analist', avatar: 'FK', status: 'online', lastActive: '5 dk önce' },
        { id: 3, name: 'Mehmet Demir', role: 'Görüntüleyici', avatar: 'MD', status: 'away', lastActive: '1 saat önce' },
        { id: 4, name: 'Ayşe Öztürk', role: 'Analist', avatar: 'AÖ', status: 'offline', lastActive: '2 gün önce' },
    ]

    const activities = [
        { id: 1, user: 'Ahmet Yılmaz', action: 'bir yorum ekledi', target: 'Q2 CBAM Raporu', time: '5 dakika önce', type: 'comment' },
        { id: 2, user: 'Fatma Kaya', action: 'dosya yükledi', target: 'emissions_2024.xlsx', time: '15 dakika önce', type: 'upload' },
        { id: 3, user: 'Mehmet Demir', action: 'tedarikçi güncelledi', target: 'Balkan Steel Import', time: '1 saat önce', type: 'edit' },
        { id: 4, user: 'Ahmet Yılmaz', action: 'sizi bahsetti', target: 'Emisyon Analizi konuşmasında', time: '2 saat önce', type: 'mention' },
        { id: 5, user: 'Fatma Kaya', action: 'rapor oluşturdu', target: 'Yearly Emission Summary', time: '3 saat önce', type: 'create' },
        { id: 6, user: 'Sistem', action: 'otomatik yedekleme tamamlandı', target: '', time: '6 saat önce', type: 'system' },
    ]

    const comments = [
        { id: 1, user: 'Ahmet Yılmaz', avatar: 'AY', text: 'Q2 raporu için Scope 3 verilerini kontrol edelim.', time: '10 dakika önce', replies: 2 },
        { id: 2, user: 'Fatma Kaya', avatar: 'FK', text: '@Mehmet Demir Balkan Steel\'den yeni emisyon verileri geldi, inceleyebilir misin?', time: '30 dakika önce', replies: 1 },
        { id: 3, user: 'Mehmet Demir', avatar: 'MD', text: 'CBAM deadline\'ı için 42 gün kaldı, hazırlıklara başlamalıyız.', time: '1 saat önce', replies: 3 },
    ]

    const sharedFiles = [
        { id: 1, name: 'Q2_CBAM_Draft.pdf', sharedBy: 'Ahmet Yılmaz', date: '2 saat önce', size: '2.4 MB' },
        { id: 2, name: 'Supplier_Analysis.xlsx', sharedBy: 'Fatma Kaya', date: '1 gün önce', size: '856 KB' },
        { id: 3, name: 'Emission_Reduction_Plan.docx', sharedBy: 'Mehmet Demir', date: '3 gün önce', size: '1.2 MB' },
    ]

    const getActivityIcon = (type) => {
        switch (type) {
            case 'comment': return '💬'
            case 'upload': return '📤'
            case 'edit': return '✏️'
            case 'mention': return '📢'
            case 'create': return '➕'
            case 'system': return '⚙️'
            default: return '📌'
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return '#00874A'
            case 'away': return '#F39200'
            case 'offline': return '#718096'
            default: return '#718096'
        }
    }

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <a href="/">Dashboard</a>
                <span className="separator">/</span>
                <span className="current">Takım İşbirliği</span>
            </div>

            <div className="page-header">
                <div>
                    <h1>👥 Takım İşbirliği</h1>
                    <p className="text-muted">Takım aktivitelerini görüntüleyin ve işbirliği yapın</p>
                </div>
            </div>

            <div className="team-layout">
                {/* Main Content */}
                <div className="team-main">
                    {/* Tabs */}
                    <div className="team-tabs mb-4">
                        <button
                            className={`team-tab ${activeTab === 'activity' ? 'active' : ''}`}
                            onClick={() => setActiveTab('activity')}
                        >
                            📋 Aktivite Akışı
                        </button>
                        <button
                            className={`team-tab ${activeTab === 'comments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('comments')}
                        >
                            💬 Yorumlar
                        </button>
                        <button
                            className={`team-tab ${activeTab === 'files' ? 'active' : ''}`}
                            onClick={() => setActiveTab('files')}
                        >
                            📁 Paylaşılan Dosyalar
                        </button>
                    </div>

                    {/* Activity Feed */}
                    {activeTab === 'activity' && (
                        <div className="card">
                            <div className="card-header">
                                <span>📋</span> Son Aktiviteler
                            </div>
                            <div className="card-body">
                                <div className="activity-feed">
                                    {activities.map(activity => (
                                        <div key={activity.id} className={`activity-item ${activity.type === 'mention' ? 'highlight' : ''}`}>
                                            <span className="activity-icon">{getActivityIcon(activity.type)}</span>
                                            <div className="activity-content">
                                                <strong>{activity.user}</strong> {activity.action}
                                                {activity.target && <span className="activity-target">{activity.target}</span>}
                                            </div>
                                            <span className="activity-time">{activity.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comments */}
                    {activeTab === 'comments' && (
                        <div className="card">
                            <div className="card-header">
                                <span>💬</span> Tartışmalar
                            </div>
                            <div className="card-body">
                                {/* New Comment */}
                                <div className="new-comment mb-4">
                                    <textarea
                                        placeholder="Yorum yazın... (@mention için @ kullanın)"
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        rows={3}
                                    />
                                    <button className="btn btn-primary" disabled={!newComment.trim()}>
                                        Gönder
                                    </button>
                                </div>

                                {/* Comments List */}
                                <div className="comments-list">
                                    {comments.map(comment => (
                                        <div key={comment.id} className="comment-item">
                                            <div className="comment-avatar">{comment.avatar}</div>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <strong>{comment.user}</strong>
                                                    <span className="comment-time">{comment.time}</span>
                                                </div>
                                                <p className="comment-text">{comment.text}</p>
                                                <div className="comment-actions">
                                                    <button>💬 Yanıtla ({comment.replies})</button>
                                                    <button>👍 Beğen</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shared Files */}
                    {activeTab === 'files' && (
                        <div className="card">
                            <div className="card-header">
                                <span>📁</span> Paylaşılan Dosyalar
                                <button className="btn btn-primary btn-sm">📤 Dosya Paylaş</button>
                            </div>
                            <div className="card-body">
                                <div className="shared-files">
                                    {sharedFiles.map(file => (
                                        <div key={file.id} className="file-item">
                                            <span className="file-icon">
                                                {file.name.endsWith('.pdf') ? '📄' : file.name.endsWith('.xlsx') ? '📊' : '📝'}
                                            </span>
                                            <div className="file-info">
                                                <strong>{file.name}</strong>
                                                <span>{file.sharedBy} tarafından • {file.date}</span>
                                            </div>
                                            <span className="file-size">{file.size}</span>
                                            <button className="btn-icon-sm">📥</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Team Members */}
                <div className="team-sidebar">
                    <div className="card">
                        <div className="card-header">
                            <span>👥</span> Takım Üyeleri
                        </div>
                        <div className="card-body">
                            <div className="team-members-list">
                                {teamMembers.map(member => (
                                    <div key={member.id} className="team-member">
                                        <div className="member-avatar">
                                            {member.avatar}
                                            <span
                                                className="status-dot"
                                                style={{ backgroundColor: getStatusColor(member.status) }}
                                            ></span>
                                        </div>
                                        <div className="member-info">
                                            <strong>{member.name}</strong>
                                            <span>{member.role}</span>
                                        </div>
                                        <span className="member-last-active">{member.lastActive}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="card">
                        <div className="card-header">
                            <span>📊</span> Bu Hafta
                        </div>
                        <div className="card-body">
                            <div className="team-stats">
                                <div className="team-stat">
                                    <span className="stat-value">24</span>
                                    <span className="stat-label">Aktivite</span>
                                </div>
                                <div className="team-stat">
                                    <span className="stat-value">12</span>
                                    <span className="stat-label">Yorum</span>
                                </div>
                                <div className="team-stat">
                                    <span className="stat-value">5</span>
                                    <span className="stat-label">Dosya</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .team-layout {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 1.5rem;
                }
                
                .team-main {
                    min-width: 0; /* Prevent overflow in grid */
                }

                .team-tabs {
                    display: flex;
                    gap: 1rem;
                    border-bottom: 2px solid #edf2f7;
                    padding-bottom: 2px;
                }

                .team-tab {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    background: none;
                    font-weight: 500;
                    color: #718096;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    margin-bottom: -4px;
                    transition: all 0.2s;
                }

                .team-tab:hover {
                    color: #00874A;
                    background: rgba(0, 135, 74, 0.05);
                    border-radius: 8px 8px 0 0;
                }

                .team-tab.active {
                    color: #00874A;
                    border-bottom-color: #00874A;
                    font-weight: 600;
                }

                .team-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .activity-feed {
                    display: flex;
                    flex-direction: column;
                }

                .activity-item {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    border-bottom: 1px solid #edf2f7;
                    align-items: flex-start;
                    transition: background 0.2s;
                }

                .activity-item:last-child {
                    border-bottom: none;
                }

                .activity-item:hover {
                    background: #f7fafc;
                }

                .activity-item.highlight {
                    background: rgba(243, 146, 0, 0.05);
                }

                .activity-icon {
                    width: 40px;
                    height: 40px;
                    background: #f7fafc;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                .activity-content {
                    flex: 1;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .activity-target {
                    font-weight: 600;
                    color: #004481;
                    margin-left: 0.25rem;
                }

                .activity-time {
                    font-size: 0.75rem;
                    color: #a0aec0;
                    white-space: nowrap;
                }

                /* Sidebar Styles */
                .team-members-list {
                    display: flex;
                    flex-direction: column;
                }

                .team-member {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid #edf2f7;
                }

                .team-member:last-child {
                    border-bottom: none;
                }

                .member-avatar {
                    width: 40px;
                    height: 40px;
                    background: #e2e8f0;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: #4a5568;
                    position: relative;
                    font-size: 0.9rem;
                }

                .status-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 2px solid white;
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                }

                .member-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    line-height: 1.2;
                }

                .member-info strong {
                    font-size: 0.9rem;
                    color: #2d3748;
                }

                .member-info span {
                    font-size: 0.75rem;
                    color: #718096;
                }

                .member-last-active {
                    font-size: 0.7rem;
                    color: #cbd5e0;
                }

                .team-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.5rem;
                    text-align: center;
                }

                .team-stat {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    padding: 0.5rem;
                    border-radius: 8px;
                    background: #f7fafc;
                }

                .stat-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #00874A;
                }

                .stat-label {
                    font-size: 0.7rem;
                    color: #718096;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .new-comment textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    resize: vertical;
                    margin-bottom: 0.75rem;
                    font-family: inherit;
                }

                .new-comment textarea:focus {
                    outline: none;
                    border-color: #00874A;
                    box-shadow: 0 0 0 3px rgba(0, 135, 74, 0.1);
                }

                .comment-item {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    border-bottom: 1px solid #edf2f7;
                }

                .comment-avatar {
                    width: 32px;
                    height: 32px;
                    background: #cbd5e0;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: white;
                    flex-shrink: 0;
                }

                .comment-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }

                .comment-time {
                    font-size: 0.75rem;
                    color: #a0aec0;
                }

                .comment-text {
                    font-size: 0.95rem;
                    color: #4a5568;
                    margin-bottom: 0.5rem;
                }

                .comment-actions button {
                    background: none;
                    border: none;
                    color: #718096;
                    font-size: 0.8rem;
                    cursor: pointer;
                    padding: 0;
                    margin-right: 1rem;
                }

                .comment-actions button:hover {
                    color: #00874A;
                }

                .file-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    margin-bottom: 0.75rem;
                    transition: all 0.2s;
                }

                .file-item:hover {
                    border-color: #00874A;
                    background: #f0fff4;
                }

                .file-icon {
                    font-size: 1.5rem;
                }

                .file-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .file-info strong {
                    font-size: 0.9rem;
                    color: #2d3748;
                }

                .file-info span {
                    font-size: 0.75rem;
                    color: #718096;
                }

                .file-size {
                    font-size: 0.8rem;
                    color: #a0aec0;
                    background: #edf2f7;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                }

                .btn-icon-sm {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.1rem;
                    padding: 0.25rem;
                    border-radius: 4px;
                    transition: background 0.2s;
                }

                .btn-icon-sm:hover {
                    background: rgba(0,0,0,0.05);
                }

                @media (max-width: 992px) {
                    .team-layout {
                        grid-template-columns: 1fr;
                    }
                    
                    .team-main {
                        order: 2;
                    }
                    
                    .team-sidebar {
                        order: 1;
                        flex-direction: row;
                        overflow-x: auto;
                    }
                    
                    .team-sidebar .card {
                        min-width: 300px;
                    }
                }
            `}</style>
        </div>
    )
}

export default TeamActivity
