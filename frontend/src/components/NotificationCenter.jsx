import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationContext'

const NotificationCenter = ({ isOpen, onClose }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications()
    const navigate = useNavigate()
    const panelRef = useRef(null)

    useEffect(() => {
        // Click outside to close
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, onClose])

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id)
        }
        if (notification.action_url) {
            navigate(notification.action_url)
            onClose()
        }
    }

    const formatTime = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = (now - date) / 1000 / 60 // minutes

        if (diff < 1) return 'Şimdi'
        if (diff < 60) return `${Math.floor(diff)} dakika önce`
        if (diff < 1440) return `${Math.floor(diff / 60)} saat önce`
        return `${Math.floor(diff / 1440)} gün önce`
    }

    if (!isOpen) return null

    return (
        <div className="notification-panel" ref={panelRef}>
            <div className="notification-header">
                <h3>🔔 Bildirimler</h3>
                {unreadCount > 0 && (
                    <button className="mark-all-read" onClick={markAllAsRead}>
                        Tümünü okundu işaretle
                    </button>
                )}
            </div>

            <div className="notification-list">
                {loading && notifications.length === 0 ? (
                    <div className="notification-loading">Yükleniyor...</div>
                ) : notifications.length === 0 ? (
                    <div className="notification-empty">
                        <span>📭</span>
                        <p>Bildirim yok</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <span className="notification-icon">{notification.icon || '🔔'}</span>
                            <div className="notification-content">
                                <strong>{notification.title}</strong>
                                <p>{notification.message}</p>
                                <span className="notification-time">{formatTime(notification.created_at)}</span>
                            </div>
                            <button
                                className="notification-delete"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default NotificationCenter
