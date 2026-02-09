/**
 * AuditLog Sayfası
 * Sistem aktivite takibi ve uyumluluk günlükleri
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import DataTable from '../components/DataTable'
import Timeline from '../components/Timeline'
import Badge from '../components/Badge'
import { useLanguage } from '../contexts/LanguageContext'


const AuditLog = () => {
    const { language } = useLanguage()
    const [logs, setLogs] = useState([])
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('table')
    const [filters, setFilters] = useState({
        action: '',
        targetType: '',
        days: 7
    })

    // Action types
    const actionTypes = language === 'tr' ? [
        { value: '', label: 'Tüm İşlemler' },
        { value: 'login', label: 'Giriş' },
        { value: 'logout', label: 'Çıkış' },
        { value: 'create', label: 'Oluşturma' },
        { value: 'update', label: 'Güncelleme' },
        { value: 'delete', label: 'Silme' },
        { value: 'view', label: 'Görüntüleme' },
        { value: 'export', label: 'Dışa Aktarma' },
        { value: 'permission_change', label: 'Yetki Değişikliği' }
    ] : [
        { value: '', label: 'All Actions' },
        { value: 'login', label: 'Login' },
        { value: 'logout', label: 'Logout' },
        { value: 'create', label: 'Create' },
        { value: 'update', label: 'Update' },
        { value: 'delete', label: 'Delete' },
        { value: 'view', label: 'View' },
        { value: 'export', label: 'Export' },
        { value: 'permission_change', label: 'Permission Change' }
    ]

    // Target types
    const targetTypes = language === 'tr' ? [
        { value: '', label: 'Tüm Hedefler' },
        { value: 'auth', label: 'Kimlik Doğrulama' },
        { value: 'company', label: 'Şirket' },
        { value: 'supplier', label: 'Tedarikçi' },
        { value: 'report', label: 'Rapor' },
        { value: 'user', label: 'Kullanıcı' },
        { value: 'dashboard', label: 'Dashboard' },
        { value: 'backup', label: 'Yedekleme' }
    ] : [
        { value: '', label: 'All Targets' },
        { value: 'auth', label: 'Authentication' },
        { value: 'company', label: 'Company' },
        { value: 'supplier', label: 'Supplier' },
        { value: 'report', label: 'Report' },
        { value: 'user', label: 'User' },
        { value: 'dashboard', label: 'Dashboard' },
        { value: 'backup', label: 'Backup' }
    ]

    // Fetch audit logs
    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                days: filters.days,
                ...(filters.action && { action: filters.action }),
                ...(filters.targetType && { target_type: filters.targetType })
            })

            const response = await fetch(`http://localhost:8000/api/audit?${params}`)
            const data = await response.json()
            if (data.success) {
                setLogs(data.logs)
            }
        } catch (error) {
            console.error('Audit logs fetch error:', error)
        } finally {
            setLoading(false)
        }
    }, [filters])

    // Fetch summary
    const fetchSummary = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8000/api/audit/summary')
            const data = await response.json()
            if (data.success) {
                setSummary(data.summary)
            }
        } catch (error) {
            console.error('Audit summary fetch error:', error)
        }
    }, [])

    useEffect(() => {
        fetchLogs()
        fetchSummary()
    }, [fetchLogs, fetchSummary])

    // Export logs
    const handleExport = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/audit/export?days=${filters.days}`)
            const data = await response.json()

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.json`
            a.click()
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Export error:', error)
        }
    }

    // Action badge color
    const getActionColor = (action) => {
        const colors = {
            login: '#10B981',
            logout: '#6B7280',
            create: '#3B82F6',
            update: '#F59E0B',
            delete: '#EF4444',
            view: '#8B5CF6',
            export: '#06B6D4',
            permission_change: '#EC4899'
        }
        return colors[action] || '#6B7280'
    }

    // Action label
    const getActionLabel = (action) => {
        const labels = {
            login: 'Giriş',
            logout: 'Çıkış',
            create: 'Oluşturma',
            update: 'Güncelleme',
            delete: 'Silme',
            view: 'Görüntüleme',
            export: 'Dışa Aktarma',
            permission_change: 'Yetki Değişikliği'
        }
        return labels[action] || action
    }

    // Target type label
    const getTargetLabel = (type) => {
        const labels = {
            auth: 'Kimlik Doğrulama',
            company: 'Şirket',
            supplier: 'Tedarikçi',
            report: 'Rapor',
            user: 'Kullanıcı',
            dashboard: 'Dashboard',
            backup: 'Yedekleme'
        }
        return labels[type] || type
    }

    // Format timestamp
    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Table columns
    const columns = useMemo(() => [
        {
            key: 'timestamp',
            label: 'Tarih/Saat',
            sortable: true,
            render: (row) => (
                <span className="audit-timestamp">{formatTime(row.timestamp)}</span>
            )
        },
        {
            key: 'user',
            label: 'Kullanıcı',
            sortable: true,
            render: (row) => (
                <div className="audit-user">
                    <div className="audit-avatar">
                        {row.user.charAt(0)}
                    </div>
                    <span>{row.user}</span>
                </div>
            )
        },
        {
            key: 'action',
            label: 'İşlem',
            sortable: true,
            render: (row) => (
                <Badge
                    text={getActionLabel(row.action)}
                    color={getActionColor(row.action)}
                />
            )
        },
        {
            key: 'target_type',
            label: 'Hedef Tipi',
            sortable: true,
            render: (row) => (
                <span className="audit-target-type">{getTargetLabel(row.target_type)}</span>
            )
        },
        {
            key: 'target_name',
            label: 'Hedef',
            sortable: true
        },
        {
            key: 'ip',
            label: 'IP Adresi',
            render: (row) => (
                <code className="audit-ip">{row.ip}</code>
            )
        },
        {
            key: 'details',
            label: 'Detaylar',
            render: (row) => {
                const details = row.details
                if (!details || Object.keys(details).length === 0) return '-'

                return (
                    <div className="audit-details">
                        {Object.entries(details).map(([key, value]) => (
                            <span key={key} className="audit-detail-item">
                                <strong>{key}:</strong> {String(value)}
                            </span>
                        ))}
                    </div>
                )
            }
        }
    ], [])

    // Timeline items
    const timelineItems = useMemo(() =>
        logs.slice(0, 10).map(log => ({
            id: log.id,
            title: `${log.user} - ${getActionLabel(log.action)}`,
            description: log.target_name !== '-' ? `${getTargetLabel(log.target_type)}: ${log.target_name}` : getTargetLabel(log.target_type),
            date: log.timestamp,
            status: log.action === 'delete' ? 'upcoming' : log.action === 'create' ? 'completed' : 'current',
            color: getActionColor(log.action),
            tags: log.details ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`) : []
        }))
        , [logs])

    return (
        <div className="audit-log-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>📋 Denetim Günlüğü</h1>
                    <p>Sistem aktivitelerini takip edin ve uyumluluk raporları oluşturun</p>
                </div>
                <button className="btn-primary" onClick={handleExport}>
                    📥 Dışa Aktar
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="audit-summary-grid">
                    <div className="summary-card">
                        <div className="summary-icon">📊</div>
                        <div className="summary-content">
                            <span className="summary-value">{summary.today_count}</span>
                            <span className="summary-label">Bugün</span>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon">📅</div>
                        <div className="summary-content">
                            <span className="summary-value">{summary.week_count}</span>
                            <span className="summary-label">Bu Hafta</span>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon">📁</div>
                        <div className="summary-content">
                            <span className="summary-value">{summary.total_count}</span>
                            <span className="summary-label">Toplam</span>
                        </div>
                    </div>
                    <div className="summary-card highlight">
                        <div className="summary-icon">👥</div>
                        <div className="summary-content">
                            <span className="summary-value">{summary.top_users?.[0]?.user || '-'}</span>
                            <span className="summary-label">En Aktif Kullanıcı</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="audit-filters">
                <div className="filter-group">
                    <label>İşlem Tipi</label>
                    <select
                        value={filters.action}
                        onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                    >
                        {actionTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Hedef Tipi</label>
                    <select
                        value={filters.targetType}
                        onChange={(e) => setFilters(prev => ({ ...prev, targetType: e.target.value }))}
                    >
                        {targetTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Zaman Aralığı</label>
                    <select
                        value={filters.days}
                        onChange={(e) => setFilters(prev => ({ ...prev, days: parseInt(e.target.value) }))}
                    >
                        <option value="1">Son 24 Saat</option>
                        <option value="7">Son 7 Gün</option>
                        <option value="30">Son 30 Gün</option>
                        <option value="90">Son 90 Gün</option>
                    </select>
                </div>
            </div>

            {/* View Toggle */}
            <div className="view-toggle-wrapper">
                <div className="view-toggle">
                    <button
                        className={`view-btn ${activeTab === 'table' ? 'active' : ''}`}
                        onClick={() => setActiveTab('table')}
                    >
                        📋 Tablo
                    </button>
                    <button
                        className={`view-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                        onClick={() => setActiveTab('timeline')}
                    >
                        ⏱️ Timeline
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="audit-content">
                {activeTab === 'table' ? (
                    <DataTable
                        data={logs}
                        columns={columns}
                        loading={loading}
                        searchable
                        paginated
                        pageSize={15}
                        emptyMessage="Denetim kaydı bulunamadı"
                    />
                ) : (
                    <div className="timeline-wrapper">
                        {loading ? (
                            <div className="loading-state">Yükleniyor...</div>
                        ) : logs.length === 0 ? (
                            <div className="empty-state">Denetim kaydı bulunamadı</div>
                        ) : (
                            <Timeline items={timelineItems} orientation="vertical" />
                        )}
                    </div>
                )}
            </div>

            {/* Action Breakdown */}
            {summary?.action_breakdown && (
                <div className="action-breakdown">
                    <h3>İşlem Dağılımı</h3>
                    <div className="breakdown-grid">
                        {Object.entries(summary.action_breakdown).map(([action, count]) => (
                            <div key={action} className="breakdown-item">
                                <Badge
                                    text={getActionLabel(action)}
                                    color={getActionColor(action)}
                                />
                                <span className="breakdown-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AuditLog
