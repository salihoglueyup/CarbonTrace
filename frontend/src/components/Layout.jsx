import { useState } from 'react'
import Sidebar from './Sidebar'
import NotificationCenter from './NotificationCenter'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'

const Layout = ({ children }) => {
    const { user } = useAuth()
    const { unreadCount } = useNotifications()
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

    const today = new Date().toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
    })

    // Kullanıcı adının baş harflerini al
    const getInitials = (name) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }

    return (
        <div className="page">
            <Sidebar />

            <main className="main">
                <header className="header">
                    <div>
                        <h2 style={{ margin: 0 }}>Dashboard</h2>
                        <p className="text-muted text-sm" style={{ margin: 0 }}>{today}</p>
                    </div>
                    <div className="header-right">
                        <div className="notification-wrapper" style={{ position: 'relative' }}>
                            <button
                                className="btn btn-outline"
                                style={{ padding: '0.5rem 1rem', position: 'relative' }}
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            >
                                <span>🔔</span>
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>
                            <NotificationCenter
                                isOpen={isNotificationOpen}
                                onClose={() => setIsNotificationOpen(false)}
                            />
                        </div>
                        <div className="header-user-section">
                            <div className="header-user-avatar">
                                {getInitials(user?.full_name)}
                            </div>
                            <div className="header-user-info">
                                <span className="header-user-name">{user?.full_name || 'Kullanıcı'}</span>
                                <span className="header-user-role">{user?.role || 'viewer'}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    )
}

export default Layout

