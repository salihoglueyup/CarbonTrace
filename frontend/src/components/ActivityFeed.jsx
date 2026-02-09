import { useState } from 'react'

/**
 * Activity Feed Widget
 * 
 * Props:
 * - activities: array - [{id, user, avatar, action, target, time, type}]
 * - maxItems: number - Maksimum gösterilecek öğe
 * - showLoadMore: boolean
 * - onLoadMore: function
 * - loading: boolean
 */
const ActivityFeed = ({
    activities = [],
    maxItems = 5,
    showLoadMore = true,
    onLoadMore,
    loading = false,
    className = ''
}) => {
    const [expanded, setExpanded] = useState(false)

    const displayedActivities = expanded ? activities : activities.slice(0, maxItems)

    const getActivityIcon = (type) => {
        switch (type) {
            case 'create': return '➕'
            case 'update': return '✏️'
            case 'delete': return '🗑️'
            case 'upload': return '📤'
            case 'download': return '📥'
            case 'login': return '🔑'
            case 'comment': return '💬'
            case 'mention': return '📢'
            case 'system': return '⚙️'
            case 'emission': return '🌿'
            case 'report': return '📊'
            default: return '📌'
        }
    }

    const getTimeAgo = (timestamp) => {
        if (typeof timestamp === 'string' && !timestamp.includes('-')) {
            return timestamp // Already formatted
        }

        const now = new Date()
        const time = new Date(timestamp)
        const diff = Math.floor((now - time) / 1000)

        if (diff < 60) return 'Şimdi'
        if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`
        if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`
        if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`
        return time.toLocaleDateString('tr-TR')
    }

    if (loading) {
        return (
            <div className={`activity-feed ${className}`}>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="activity-item skeleton-item">
                        <div className="skeleton skeleton-avatar"></div>
                        <div className="activity-skeleton-content">
                            <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (activities.length === 0) {
        return (
            <div className={`activity-feed empty ${className}`}>
                <div className="activity-empty">
                    <span className="empty-icon">📭</span>
                    <p>Henüz aktivite yok</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`activity-feed ${className}`}>
            <div className="activity-list">
                {displayedActivities.map((activity, index) => (
                    <div
                        key={activity.id}
                        className={`activity-item ${activity.type === 'mention' ? 'highlight' : ''}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        {/* Avatar / Icon */}
                        <div className="activity-avatar">
                            {activity.avatar || (
                                <span className="activity-type-icon">
                                    {getActivityIcon(activity.type)}
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="activity-content">
                            <div className="activity-text">
                                <strong className="activity-user">{activity.user}</strong>
                                <span className="activity-action">{activity.action}</span>
                                {activity.target && (
                                    <span className="activity-target">{activity.target}</span>
                                )}
                            </div>
                            <span className="activity-time">{getTimeAgo(activity.time)}</span>
                        </div>

                        {/* Badge for new items */}
                        {activity.isNew && (
                            <span className="activity-badge">Yeni</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Load More / Expand */}
            {showLoadMore && activities.length > maxItems && (
                <button
                    className="activity-load-more"
                    onClick={() => {
                        if (onLoadMore) {
                            onLoadMore()
                        } else {
                            setExpanded(!expanded)
                        }
                    }}
                >
                    {expanded ? '↑ Daha az göster' : `↓ ${activities.length - maxItems} aktivite daha`}
                </button>
            )}
        </div>
    )
}

export default ActivityFeed
