import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import Toggle from '../components/Toggle'
import ThemeCustomizer from '../components/ThemeCustomizer'

const Settings = () => {
    const { user } = useAuth()
    const { language, setLanguage, t, availableLanguages } = useLanguage()
    const [activeTab, setActiveTab] = useState('profile')
    const [saved, setSaved] = useState(false)
    const [showCustomizer, setShowCustomizer] = useState(false)

    const [profile, setProfile] = useState({
        fullName: user?.full_name || '',
        email: user?.email || '',
        phone: '+90 532 XXX XX XX',
        company: 'Anadolu Demir Çelik',
    })

    const [notifications, setNotifications] = useState({
        emailReports: true,
        emailAlerts: true,
        cbamUpdates: true,
        weeklyDigest: false,
    })

    const [preferences, setPreferences] = useState({
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        theme: 'light',
        aiProvider: 'openai',
        aiApiKey: '',
    })

    // Sync language changes with context
    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage)
    }

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const tabs = [
        { id: 'profile', label: 'Profil', icon: '👤' },
        { id: 'notifications', label: 'Bildirimler', icon: '🔔' },
        { id: 'preferences', label: 'Tercihler', icon: '⚙️' },
        { id: 'appearance', label: 'Görünüm', icon: '🎨' },
        { id: 'security', label: 'Güvenlik', icon: '🔒' },
    ]

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <a href="/">Dashboard</a>
                <span className="separator">/</span>
                <span className="current">Ayarlar</span>
            </div>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>⚙️ Ayarlar</h1>
                    <p className="text-muted">Hesap ve uygulama ayarlarını yönetin</p>
                </div>
            </div>

            {/* Settings Layout */}
            <div className="settings-layout">
                {/* Sidebar Tabs */}
                <div className="settings-sidebar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Settings Content */}
                <div className="settings-content">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="card">
                            <div className="card-header">
                                <span>👤</span> Profil Bilgileri
                            </div>
                            <div className="card-body">
                                <div className="profile-avatar">
                                    <div className="avatar">
                                        {profile.fullName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <button className="btn btn-secondary btn-sm">Fotoğraf Değiştir</button>
                                </div>

                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label>Ad Soyad</label>
                                        <input
                                            type="text"
                                            value={profile.fullName}
                                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>E-posta</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label>Telefon</label>
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Şirket</label>
                                        <input
                                            type="text"
                                            value={profile.company}
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Rol</label>
                                    <input
                                        type="text"
                                        value={user?.role || 'Viewer'}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="card">
                            <div className="card-header">
                                <span>🔔</span> Bildirim Tercihleri
                            </div>
                            <div className="card-body">
                                <div className="settings-toggle-list">
                                    <div className="settings-toggle-item">
                                        <div className="settings-toggle-info">
                                            <div className="settings-toggle-icon">📧</div>
                                            <div>
                                                <strong>Rapor Bildirimleri</strong>
                                                <p>Yeni raporlar hazır olduğunda e-posta al</p>
                                            </div>
                                        </div>
                                        <Toggle
                                            checked={notifications.emailReports}
                                            onChange={(checked) => setNotifications({ ...notifications, emailReports: checked })}
                                            size="md"
                                            color="primary"
                                        />
                                    </div>

                                    <div className="settings-toggle-item">
                                        <div className="settings-toggle-info">
                                            <div className="settings-toggle-icon">⚠️</div>
                                            <div>
                                                <strong>Risk Uyarıları</strong>
                                                <p>CBAM risk seviyesi değiştiğinde bildirim al</p>
                                            </div>
                                        </div>
                                        <Toggle
                                            checked={notifications.emailAlerts}
                                            onChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                                            size="md"
                                            color="warning"
                                        />
                                    </div>

                                    <div className="settings-toggle-item">
                                        <div className="settings-toggle-info">
                                            <div className="settings-toggle-icon">📋</div>
                                            <div>
                                                <strong>CBAM Güncellemeleri</strong>
                                                <p>Mevzuat değişiklikleri hakkında bilgi al</p>
                                            </div>
                                        </div>
                                        <Toggle
                                            checked={notifications.cbamUpdates}
                                            onChange={(checked) => setNotifications({ ...notifications, cbamUpdates: checked })}
                                            size="md"
                                            color="success"
                                        />
                                    </div>

                                    <div className="settings-toggle-item">
                                        <div className="settings-toggle-info">
                                            <div className="settings-toggle-icon">📅</div>
                                            <div>
                                                <strong>Haftalık Özet</strong>
                                                <p>Her hafta performans özeti al</p>
                                            </div>
                                        </div>
                                        <Toggle
                                            checked={notifications.weeklyDigest}
                                            onChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
                                            size="md"
                                            color="info"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <div className="card">
                            <div className="card-header">
                                <span>⚙️</span> Uygulama Tercihleri
                            </div>
                            <div className="card-body">
                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label>{t('settings.language')}</label>
                                        <select
                                            value={language}
                                            onChange={(e) => handleLanguageChange(e.target.value)}
                                            className="language-select"
                                        >
                                            {availableLanguages.map(lang => (
                                                <option key={lang.code} value={lang.code}>
                                                    {lang.flag} {lang.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Para Birimi</label>
                                        <select
                                            value={preferences.currency}
                                            onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                                        >
                                            <option value="EUR">Euro (€)</option>
                                            <option value="USD">US Dollar ($)</option>
                                            <option value="TRY">Türk Lirası (₺)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label>Tarih Formatı</label>
                                        <select
                                            value={preferences.dateFormat}
                                            onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                                        >
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Tema</label>
                                        <select
                                            value={preferences.theme}
                                            onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                                        >
                                            <option value="light">Açık</option>
                                            <option value="dark">Koyu</option>
                                            <option value="auto">Otomatik</option>
                                        </select>
                                    </div>
                                </div>

                                {/* AI Provider Section */}
                                <div className="settings-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--bbva-gray-100)' }}>
                                    <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        🤖 {language === 'tr' ? 'AI Asistan Ayarları' : 'AI Assistant Settings'}
                                    </h4>
                                    <div className="form-row-2">
                                        <div className="form-group">
                                            <label>{language === 'tr' ? 'AI Provider' : 'AI Provider'}</label>
                                            <select
                                                value={preferences.aiProvider}
                                                onChange={(e) => setPreferences({ ...preferences, aiProvider: e.target.value })}
                                            >
                                                <option value="openai">🟢 OpenAI (GPT-4o)</option>
                                                <option value="gemini">🔵 Google Gemini</option>
                                                <option value="claude">🟣 Anthropic Claude</option>
                                                <option value="llama">🦙 Llama (Local/Groq)</option>
                                            </select>
                                            <small className="text-muted">
                                                {language === 'tr' ? 'Chat ve analizler için kullanılacak AI' : 'AI used for chat and analysis'}
                                            </small>
                                        </div>
                                        <div className="form-group">
                                            <label>API Key ({preferences.aiProvider.toUpperCase()})</label>
                                            <input
                                                type="password"
                                                placeholder="sk-... veya API key"
                                                value={preferences.aiApiKey}
                                                onChange={(e) => setPreferences({ ...preferences, aiApiKey: e.target.value })}
                                            />
                                            <small className="text-muted">
                                                {language === 'tr' ? 'API anahtarınız güvenli bir şekilde saklanır' : 'Your API key is stored securely'}
                                            </small>
                                        </div>
                                    </div>

                                    {/* Provider Status */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        alignItems: 'center',
                                        padding: '0.75rem 1rem',
                                        background: 'var(--bbva-gray-100)',
                                        borderRadius: '8px',
                                        marginTop: '1rem'
                                    }}>
                                        <span style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: preferences.aiApiKey ? 'var(--status-success)' : 'var(--bbva-gray-500)'
                                        }}></span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--bbva-gray-700)' }}>
                                            {preferences.aiApiKey
                                                ? (language === 'tr' ? 'API bağlantısı hazır' : 'API connection ready')
                                                : (language === 'tr' ? 'API anahtarı girilmedi' : 'No API key entered')
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div className="card">
                            <div className="card-header">
                                <span>🎨</span> Görünüm Ayarları
                            </div>
                            <div className="card-body">
                                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                                    Renkleri, yazı boyutunu ve diğer görünüm ayarlarını özelleştirin.
                                </p>

                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowCustomizer(true)}
                                >
                                    🎨 Tema Özelleştirici'yi Aç
                                </button>

                                <div style={{ marginTop: '2rem' }}>
                                    <h4 style={{ marginBottom: '1rem' }}>Hazır Temalar</h4>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: 16, height: 16, borderRadius: 4, background: '#00874A' }}></span>
                                            BBVA Default
                                        </button>
                                        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: 16, height: 16, borderRadius: 4, background: '#0077B6' }}></span>
                                            Ocean
                                        </button>
                                        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: 16, height: 16, borderRadius: 4, background: '#2D6A4F' }}></span>
                                            Forest
                                        </button>
                                        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: 16, height: 16, borderRadius: 4, background: '#7209B7' }}></span>
                                            Purple
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="card">
                            <div className="card-header">
                                <span>🔒</span> Güvenlik
                            </div>
                            <div className="card-body">
                                <div className="security-section">
                                    <h4>Şifre Değiştir</h4>
                                    <div className="form-group">
                                        <label>Mevcut Şifre</label>
                                        <input type="password" placeholder="••••••••" />
                                    </div>
                                    <div className="form-row-2">
                                        <div className="form-group">
                                            <label>Yeni Şifre</label>
                                            <input type="password" placeholder="••••••••" />
                                        </div>
                                        <div className="form-group">
                                            <label>Şifre Tekrar</label>
                                            <input type="password" placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <button className="btn btn-secondary">Şifreyi Güncelle</button>
                                </div>

                                <hr />

                                <div className="security-section">
                                    <h4>Aktif Oturumlar</h4>
                                    <div className="session-list">
                                        <div className="session-item current">
                                            <div className="session-icon">💻</div>
                                            <div className="session-info">
                                                <strong>Windows - Chrome</strong>
                                                <p>Istanbul, Turkey • Şu an aktif</p>
                                            </div>
                                            <span className="badge badge-success">Bu Cihaz</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="settings-actions">
                        {saved && (
                            <span className="save-success">✓ Değişiklikler kaydedildi</span>
                        )}
                        <button className="btn btn-primary" onClick={handleSave}>
                            💾 Değişiklikleri Kaydet
                        </button>
                    </div>
                </div>
            </div>

            {/* Theme Customizer Modal */}
            <ThemeCustomizer
                isOpen={showCustomizer}
                onClose={() => setShowCustomizer(false)}
            />
        </div>
    )
}

export default Settings
