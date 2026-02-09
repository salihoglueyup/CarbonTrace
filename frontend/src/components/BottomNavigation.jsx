import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const BottomNavigation = () => {
    const [moreOpen, setMoreOpen] = useState(false)

    const mainNavItems = [
        { to: '/', icon: '📊', label: 'Ana Sayfa' },
        { to: '/chat', icon: '🤖', label: 'AI' },
        { to: '/cbam', icon: '💰', label: 'CBAM' },
        { to: '/reports', icon: '📋', label: 'Raporlar' },
    ]

    const moreItems = [
        { to: '/companies', icon: '🏢', label: 'Şirketler' },
        { to: '/suppliers', icon: '🏭', label: 'Tedarikçiler' },
        { to: '/emissions', icon: '🌿', label: 'Emisyon' },
        { to: '/compliance', icon: '✅', label: 'Uyumluluk' },
        { to: '/documents', icon: '📎', label: 'Dokümanlar' },
        { to: '/scenarios', icon: '🎮', label: 'Senaryo' },
        { to: '/calendar', icon: '📅', label: 'Takvim' },
        { to: '/settings', icon: '⚙️', label: 'Ayarlar' },
    ]

    return (
        <>
            <nav className="bottom-nav">
                {mainNavItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
                <button
                    className={`bottom-nav-item ${moreOpen ? 'active' : ''}`}
                    onClick={() => setMoreOpen(!moreOpen)}
                >
                    <span className="nav-icon">☰</span>
                    <span className="nav-label">Daha</span>
                </button>
            </nav>

            {/* More Menu */}
            {moreOpen && (
                <div className="more-menu-overlay" onClick={() => setMoreOpen(false)}>
                    <div className="more-menu" onClick={e => e.stopPropagation()}>
                        <div className="more-menu-header">
                            <h3>Tüm Sayfalar</h3>
                            <button onClick={() => setMoreOpen(false)}>×</button>
                        </div>
                        <div className="more-menu-grid">
                            {moreItems.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className="more-menu-item"
                                    onClick={() => setMoreOpen(false)}
                                >
                                    <span className="item-icon">{item.icon}</span>
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default BottomNavigation
