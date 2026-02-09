import { useState, useRef, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useLanguage } from '../contexts/LanguageContext'
import { usersAPI } from '../services/api'
import { useToast } from '../contexts/ToastContext'

const Admin = () => {
    const { language } = useLanguage()
    const { showToast } = useToast()
    const [activeTab, setActiveTab] = useState('users')
    const activityIdCounter = useRef(7)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers()
        }
    }, [activeTab])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const data = await usersAPI.getAll()
            setUsers(data)
        } catch (error) {
            console.error('Error fetching users:', error)
            showToast('Kullanıcılar yüklenirken hata oluştu', 'error')
        } finally {
            setLoading(false)
        }
    }

    const [activityLog, setActivityLog] = useState(language === 'tr' ? [
        { id: 1, user: 'Ahmet Yılmaz', action: 'Şirket ekledi', target: 'Akdeniz Kimya', time: '5 dakika önce', type: 'create' },
        { id: 2, user: 'Fatma Kaya', action: 'Rapor indirdi', target: 'Q4 Emisyon Raporu', time: '15 dakika önce', type: 'download' },
        { id: 3, user: 'Sistem', action: 'Otomatik yedekleme', target: 'cbamguard.db', time: '1 saat önce', type: 'system' },
        { id: 4, user: 'Mehmet Demir', action: 'Tedarikçi güncelledi', target: 'Balkan Steel', time: '2 saat önce', type: 'update' },
        { id: 5, user: 'Ayşe Öztürk', action: 'Giriş yaptı', target: '-', time: '3 saat önce', type: 'login' },
        { id: 6, user: 'Ahmet Yılmaz', action: 'Kullanıcı rolü değiştirdi', target: 'Fatma Kaya -> analyst', time: '1 gün önce', type: 'admin' },
    ] : [
        { id: 1, user: 'Ahmet Yılmaz', action: 'Added company', target: 'Akdeniz Kimya', time: '5 minutes ago', type: 'create' },
        { id: 2, user: 'Fatma Kaya', action: 'Downloaded report', target: 'Q4 Emission Report', time: '15 minutes ago', type: 'download' },
        { id: 3, user: 'System', action: 'Auto backup', target: 'cbamguard.db', time: '1 hour ago', type: 'system' },
        { id: 4, user: 'Mehmet Demir', action: 'Updated supplier', target: 'Balkan Steel', time: '2 hours ago', type: 'update' },
        { id: 5, user: 'Ayşe Öztürk', action: 'Logged in', target: '-', time: '3 hours ago', type: 'login' },
        { id: 6, user: 'Ahmet Yılmaz', action: 'Changed user role', target: 'Fatma Kaya -> analyst', time: '1 day ago', type: 'admin' },
    ])

    const usageStats = language === 'tr' ? [
        { day: 'Pzt', logins: 45, actions: 120 },
        { day: 'Sal', logins: 52, actions: 145 },
        { day: 'Çar', logins: 48, actions: 132 },
        { day: 'Per', logins: 61, actions: 178 },
        { day: 'Cum', logins: 55, actions: 156 },
        { day: 'Cmt', logins: 12, actions: 34 },
        { day: 'Paz', logins: 8, actions: 21 },
    ] : [
        { day: 'Mon', logins: 45, actions: 120 },
        { day: 'Tue', logins: 52, actions: 145 },
        { day: 'Wed', logins: 48, actions: 132 },
        { day: 'Thu', logins: 61, actions: 178 },
        { day: 'Fri', logins: 55, actions: 156 },
        { day: 'Sat', logins: 12, actions: 34 },
        { day: 'Sun', logins: 8, actions: 21 },
    ]

    const systemStats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        totalCompanies: 5,
        totalDocuments: 23,
        storageUsed: '2.4 GB',
        apiCalls: '12,456'
    }

    const handleRoleChange = async (userId, newRole) => {
        try {
            await usersAPI.updateRole(userId, newRole)
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
            showToast('Kullanıcı rolü güncellendi', 'success')

            // Log activity (Frontend only for now, ideally backend logs this)
            const newId = activityIdCounter.current++
            setActivityLog([{
                id: newId,
                user: 'Admin',
                action: language === 'tr' ? 'Kullanıcı rolü değiştirdi' : 'Changed user role',
                target: `${users.find(u => u.id === userId)?.full_name} -> ${newRole}`,
                time: language === 'tr' ? 'Şimdi' : 'Now',
                type: 'admin'
            }, ...activityLog])

        } catch (error) {
            console.error('Role update error:', error)
            showToast('Rol güncellenirken hata oluştu', 'error')
        }
    }

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            const newStatus = !currentStatus
            await usersAPI.updateStatus(userId, newStatus)
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: newStatus } : u))
            showToast('Kullanıcı durumu güncellendi', 'success')
        } catch (error) {
            console.error('Status update error:', error)
            showToast('Durum güncellenirken hata oluştu', 'error')
        }
    }

    const getActionIcon = (type) => {
        switch (type) {
            case 'create': return '➕'
            case 'update': return '✏️'
            case 'delete': return '🗑️'
            case 'download': return '📥'
            case 'login': return '🔑'
            case 'admin': return '👤'
            case 'system': return '⚙️'
            default: return '📌'
        }
    }

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <a href="/">Dashboard</a>
                <span className="separator">/</span>
                <span className="current">{language === 'tr' ? 'Admin Paneli' : 'Admin Panel'}</span>
            </div>

            <div className="page-header">
                <div>
                    <h1>👤 {language === 'tr' ? 'Admin Paneli' : 'Admin Panel'}</h1>
                    <p className="text-muted">
                        {language === 'tr'
                            ? 'Kullanıcıları yönetin, aktiviteleri izleyin ve sistem ayarlarını yapılandırın'
                            : 'Manage users, monitor activities and configure system settings'}
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid mb-4">
                <div className="stat-card">
                    <div className="stat-icon blue">👥</div>
                    <div className="stat-content">
                        <h4>Toplam Kullanıcı</h4>
                        <div className="value">{systemStats.totalUsers}</div>
                        <div className="change positive">{systemStats.activeUsers} aktif</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">🏢</div>
                    <div className="stat-content">
                        <h4>Şirketler</h4>
                        <div className="value">{systemStats.totalCompanies}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">📄</div>
                    <div className="stat-content">
                        <h4>Dokümanlar</h4>
                        <div className="value">{systemStats.totalDocuments}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💾</div>
                    <div className="stat-content">
                        <h4>Depolama</h4>
                        <div className="value">{systemStats.storageUsed}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs mb-4">
                <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                    👥 Kullanıcılar
                </button>
                <button className={`admin-tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
                    📋 Aktivite Logu
                </button>
                <button className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                    📊 Analitik
                </button>
                <button className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                    ⚙️ Sistem Ayarları
                </button>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="card">
                    <div className="card-header">
                        <span>👥</span> Kullanıcı Yönetimi
                        <button className="btn btn-primary btn-sm">➕ Yeni Kullanıcı</button>
                    </div>
                    <div className="card-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>Kullanıcı</th>
                                    <th>Şirket</th>
                                    <th>Rol</th>
                                    <th>Durum</th>
                                    <th>Son Giriş</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">{user.full_name?.charAt(0) || 'U'}</div>
                                                <div>
                                                    <strong>{user.full_name}</strong>
                                                    <br /><small className="text-muted">{user.email}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.company_id || '-'}</td>
                                        <td>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="role-select"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="analyst">Analist</option>
                                                <option value="viewer">Görüntüleyici</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                                {user.is_active ? (language === 'tr' ? '🟢 Aktif' : '🟢 Active') : (language === 'tr' ? '🔴 Pasif' : '🔴 Inactive')}
                                            </span>
                                        </td>
                                        <td>{new Date(user.last_login).toLocaleString('tr-TR')}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon-sm" onClick={() => handleStatusToggle(user.id, user.is_active)}>
                                                    {user.is_active ? '⏸️' : '▶️'}
                                                </button>
                                                <button className="btn-icon-sm">✏️</button>
                                                <button className="btn-icon-sm danger">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
                <div className="card">
                    <div className="card-header">
                        <span>📋</span> Aktivite Logu
                        <button className="btn btn-secondary btn-sm">📥 Dışa Aktar</button>
                    </div>
                    <div className="card-body">
                        <div className="activity-log">
                            {activityLog.map(log => (
                                <div key={log.id} className="activity-item">
                                    <span className="activity-icon">{getActionIcon(log.type)}</span>
                                    <div className="activity-content">
                                        <strong>{log.user}</strong> {log.action}
                                        {log.target !== '-' && <span className="activity-target">{log.target}</span>}
                                    </div>
                                    <span className="activity-time">{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="card">
                    <div className="card-header">
                        <span>📊</span> Kullanım Analizi
                    </div>
                    <div className="card-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={usageStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="logins" name="Girişler" fill="#00874A" />
                                <Bar dataKey="actions" name="İşlemler" fill="#004481" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="card">
                    <div className="card-header">
                        <span>⚙️</span> Sistem Ayarları
                    </div>
                    <div className="card-body">
                        <div className="settings-section">
                            <h4>🔒 Güvenlik</h4>
                            <div className="setting-item">
                                <span>İki Faktörlü Kimlik Doğrulama (2FA)</span>
                                <label className="toggle"><input type="checkbox" /><span className="toggle-slider"></span></label>
                            </div>
                            <div className="setting-item">
                                <span>Oturum Zaman Aşımı (dakika)</span>
                                <input type="number" defaultValue={30} style={{ width: '80px' }} />
                            </div>
                        </div>
                        <hr />
                        <div className="settings-section">
                            <h4>📧 E-posta Bildirimleri</h4>
                            <div className="setting-item">
                                <span>Haftalık Özet E-postası</span>
                                <label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
                            </div>
                            <div className="setting-item">
                                <span>CBAM Deadline Hatırlatmaları</span>
                                <label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
                            </div>
                        </div>
                        <hr />
                        <div className="settings-section">
                            <h4>💾 Yedekleme</h4>
                            <div className="setting-item">
                                <span>Otomatik Yedekleme</span>
                                <label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
                            </div>
                            <button className="btn btn-secondary mt-2">📥 Manuel Yedek Al</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Admin
