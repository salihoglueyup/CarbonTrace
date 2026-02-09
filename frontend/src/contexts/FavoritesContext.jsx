import { useState, useEffect, createContext, useContext } from 'react'

const FavoritesContext = createContext()

export const useFavorites = () => useContext(FavoritesContext)

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('cbam_favorites')
        return saved ? JSON.parse(saved) : []
    })

    const [recentItems, setRecentItems] = useState(() => {
        const saved = localStorage.getItem('cbam_recent')
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        localStorage.setItem('cbam_favorites', JSON.stringify(favorites))
    }, [favorites])

    useEffect(() => {
        localStorage.setItem('cbam_recent', JSON.stringify(recentItems))
    }, [recentItems])

    const addFavorite = (item) => {
        if (!favorites.find(f => f.id === item.id && f.type === item.type)) {
            setFavorites([...favorites, { ...item, addedAt: new Date().toISOString() }])
        }
    }

    const removeFavorite = (id, type) => {
        setFavorites(favorites.filter(f => !(f.id === id && f.type === type)))
    }

    const isFavorite = (id, type) => {
        return favorites.some(f => f.id === id && f.type === type)
    }

    const toggleFavorite = (item) => {
        if (isFavorite(item.id, item.type)) {
            removeFavorite(item.id, item.type)
        } else {
            addFavorite(item)
        }
    }

    const addRecentItem = (item) => {
        const filtered = recentItems.filter(r => !(r.id === item.id && r.type === item.type))
        const updated = [{ ...item, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 10)
        setRecentItems(updated)
    }

    const clearRecent = () => {
        setRecentItems([])
    }

    return (
        <FavoritesContext.Provider value={{
            favorites,
            recentItems,
            addFavorite,
            removeFavorite,
            isFavorite,
            toggleFavorite,
            addRecentItem,
            clearRecent
        }}>
            {children}
        </FavoritesContext.Provider>
    )
}

// Quick Access Panel Component
export const QuickAccessPanel = ({ isOpen, onClose }) => {
    const { favorites, recentItems, removeFavorite, clearRecent } = useFavorites()

    if (!isOpen) return null

    const getIcon = (type) => {
        switch (type) {
            case 'company': return '🏢'
            case 'supplier': return '🏭'
            case 'document': return '📄'
            case 'report': return '📋'
            case 'page': return '📌'
            default: return '⭐'
        }
    }

    return (
        <div className="quick-access-overlay" onClick={onClose}>
            <div className="quick-access-panel" onClick={e => e.stopPropagation()}>
                <div className="quick-access-header">
                    <h3>⭐ Hızlı Erişim</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* Favorites */}
                <div className="quick-section">
                    <h4>⭐ Favoriler</h4>
                    {favorites.length === 0 ? (
                        <p className="empty-text">Henüz favori eklenmemiş</p>
                    ) : (
                        <div className="quick-items">
                            {favorites.map(item => (
                                <div key={`${item.type}-${item.id}`} className="quick-item">
                                    <span className="item-icon">{getIcon(item.type)}</span>
                                    <span className="item-name">{item.name}</span>
                                    <button
                                        className="remove-btn"
                                        onClick={() => removeFavorite(item.id, item.type)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent */}
                <div className="quick-section">
                    <div className="section-header">
                        <h4>🕐 Son Görüntülenen</h4>
                        {recentItems.length > 0 && (
                            <button className="clear-btn" onClick={clearRecent}>Temizle</button>
                        )}
                    </div>
                    {recentItems.length === 0 ? (
                        <p className="empty-text">Son görüntülenen yok</p>
                    ) : (
                        <div className="quick-items">
                            {recentItems.map(item => (
                                <div key={`recent-${item.type}-${item.id}`} className="quick-item">
                                    <span className="item-icon">{getIcon(item.type)}</span>
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-time">
                                        {new Date(item.viewedAt).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FavoritesContext
