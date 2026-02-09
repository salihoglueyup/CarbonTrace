import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'

// Main menu items (always visible, not collapsible)
const getMainMenuItems = (t) => [
    { to: '/', icon: '📊', label: t('nav.dashboard') },
    { to: '/chat', icon: '🤖', label: t('nav.chat') },
    { to: '/ai-insights', icon: '🧠', label: t('nav.aiInsights') },
]

// Collapsible sections
const getNavSections = (t) => ({
    [t('sidebar.management')]: [
        { to: '/companies', icon: '🏢', label: t('nav.companies') },
        { to: '/suppliers', icon: '🏭', label: t('nav.suppliers') },
        { to: '/projects', icon: '📁', label: t('nav.projects') },
        { to: '/documents', icon: '📎', label: t('nav.documents') },
        { to: '/team', icon: '👥', label: t('nav.team') },
    ],
    [t('sidebar.analysis')]: [
        { to: '/emissions', icon: '🌿', label: t('nav.emissions') },
        { to: '/cbam', icon: '💰', label: t('nav.cbam') },
        { to: '/comparison', icon: '🔄', label: t('nav.comparison') },
        { to: '/compliance', icon: '✅', label: t('nav.compliance') },
        { to: '/scenarios', icon: '🎮', label: t('nav.scenarios') },
        { to: '/visualization', icon: '📈', label: t('nav.visualization') },
    ],
    [t('sidebar.finance')]: [
        { to: '/finance', icon: '💰', label: t('nav.financialProjection') },
        { to: '/green-credit', icon: '🏦', label: t('nav.greenCredit') },
        { to: '/hedging', icon: '📈', label: t('nav.hedging') },
    ],
    [t('sidebar.other')]: [
        { to: '/calendar', icon: '📅', label: t('nav.calendar') },
        { to: '/reports', icon: '📋', label: t('nav.reports') },
        { to: '/performance', icon: '⚡', label: t('nav.performance') },
        { to: '/admin', icon: '👤', label: t('nav.admin'), requiredRole: 'admin' },
        { to: '/settings', icon: '⚙️', label: t('nav.settings') },
        { to: '/audit', icon: '📜', label: t('nav.audit') },
        { to: '/help', icon: '🆘', label: t('nav.help') },
    ],
})

const getSectionIcons = (t) => ({
    [t('sidebar.management')]: '📂',
    [t('sidebar.analysis')]: '📊',
    [t('sidebar.finance')]: '💳',
    [t('sidebar.other')]: '⚙️',
})

const Sidebar = () => {
    const { logout, user } = useAuth()
    const navigate = useNavigate()
    const { t, language } = useLanguage()
    const { toggleTheme, isDark } = useTheme()

    // Get translated nav sections
    const mainMenuItems = getMainMenuItems(t)
    const navSections = getNavSections(t)
    const sectionIcons = getSectionIcons(t)

    // Track which sections are expanded (all collapsed by default)
    const [expandedSections, setExpandedSections] = useState({})

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="sidebar">
            {/* Brand Section */}
            <div className="sidebar-brand">
                <h1>
                    <img src="/src/assets/logo.svg" alt="CarbonTrace Logo" className="logo h-8 w-8" />
                    CarbonTrace
                </h1>
                <div className="brand-subtitle">
                    <span className="powered-by">powered by</span>
                    <span className="garanti-text">Garanti BBVA</span>
                </div>
            </div>

            {/* Main Menu - Always Visible (Not Collapsible) */}
            <div className="main-menu-fixed">
                {mainMenuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.to}
                        className={({ isActive }) => `nav-item main-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>

            {/* Collapsible Sections - Scrollable */}
            <nav className="sidebar-nav">
                {Object.entries(navSections).map(([sectionName, items]) => (
                    <div key={sectionName} className="nav-section-group">
                        {/* Section Header - Clickable */}
                        <button
                            className={`nav-section-header ${expandedSections[sectionName] ? 'expanded' : ''}`}
                            onClick={() => toggleSection(sectionName)}
                        >
                            <span className="section-icon">{sectionIcons[sectionName]}</span>
                            <span className="section-title">{sectionName}</span>
                            <span className="section-arrow">
                                {expandedSections[sectionName] ? '▼' : '▶'}
                            </span>
                        </button>

                        {/* Section Items - Collapsible */}
                        <div className={`nav-section-items ${expandedSections[sectionName] ? 'expanded' : 'collapsed'}`}>
                            {items.map((item, index) => {
                                // Role check
                                if (item.requiredRole && user?.role !== item.requiredRole) {
                                    return null
                                }

                                return (
                                    <NavLink
                                        key={index}
                                        to={item.to}
                                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                    >
                                        <span className="icon">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </NavLink>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer - Fixed at Bottom */}
            <div className="sidebar-footer">
                {/* Theme Toggle */}
                <button
                    className={`theme-toggle-compact ${isDark ? 'dark' : 'light'}`}
                    onClick={toggleTheme}
                    title={isDark ? 'Light Mode' : 'Dark Mode'}
                >
                    <span className="theme-icon">{isDark ? '☀️' : '🌙'}</span>
                    <span className="theme-label">
                        {isDark
                            ? (language === 'tr' ? 'Açık Mod' : 'Light')
                            : (language === 'tr' ? 'Koyu Mod' : 'Dark')
                        }
                    </span>
                </button>

                <button className="logout-btn" onClick={handleLogout}>
                    <span className="logout-icon">🚪</span>
                    <span>{t('sidebar.logout')}</span>
                </button>
            </div>
        </div>
    )
}

export default Sidebar

