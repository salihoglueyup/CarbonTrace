import { useState, useEffect, useCallback } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import DataTable from '../components/DataTable'
import Badge from '../components/Badge'
import { Rating } from '../components/PremiumUI'
import { useLanguage } from '../contexts/LanguageContext'

const Suppliers = () => {
    const { language } = useLanguage()
    const [suppliers, setSuppliers] = useState([])
    const [summary, setSummary] = useState(null)
    const [filter, setFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        country: 'Türkiye',
        sector: '',
        contact_email: '',
        annual_emissions: 0,
        scope3_contribution: 0,
        risk_level: 'medium',
        rating: 3
    })
    const [sortBy, setSortBy] = useState('name')

    const fetchSuppliers = useCallback(async () => {
        try {
            let url = 'http://localhost:8000/api/suppliers'
            if (filter !== 'all') {
                if (filter === 'high_risk') {
                    url += '?risk_level=high'
                } else if (filter === 'not_ready') {
                    url += '?cbam_ready=false'
                } else if (filter === 'verified') {
                    url += '?verified=true'
                }
            }
            const response = await fetch(url)
            const data = await response.json()
            if (data.success) {
                setSuppliers(data.suppliers)
                setSummary(data.summary)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }, [filter])

    useEffect(() => {
        fetchSuppliers()
    }, [fetchSuppliers])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const url = editingSupplier
                ? `http://localhost:8000/api/suppliers/${editingSupplier.id}`
                : 'http://localhost:8000/api/suppliers'

            const response = await fetch(url, {
                method: editingSupplier ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                setShowModal(false)
                setEditingSupplier(null)
                resetForm()
                fetchSuppliers()
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Bu tedarikçiyi silmek istediğinize emin misiniz?')) return
        try {
            await fetch(`http://localhost:8000/api/suppliers/${id}`, { method: 'DELETE' })
            fetchSuppliers()
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleVerify = async (id) => {
        try {
            await fetch(`http://localhost:8000/api/suppliers/${id}/verify`, { method: 'POST' })
            fetchSuppliers()
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '', country: 'Türkiye', sector: '', contact_email: '',
            annual_emissions: 0, scope3_contribution: 0, risk_level: 'medium', rating: 3
        })
    }

    const handleRatingChange = async (supplierId, newRating) => {
        try {
            await fetch(`http://localhost:8000/api/suppliers/${supplierId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: newRating })
            })
            // Lokal state'i güncelle
            setSuppliers(prev => prev.map(s =>
                s.id === supplierId ? { ...s, rating: newRating } : s
            ))
        } catch (error) {
            console.error('Rating update error:', error)
        }
    }

    // Sıralama seçenekleri
    const sortedSuppliers = [...suppliers].sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
        if (sortBy === 'emissions') return (b.annual_emissions || 0) - (a.annual_emissions || 0)
        if (sortBy === 'risk') {
            const riskOrder = { high: 3, medium: 2, low: 1 }
            return (riskOrder[b.risk_level] || 0) - (riskOrder[a.risk_level] || 0)
        }
        return (a.name || '').localeCompare(b.name || '')
    })

    // Ortalama puan hesapla
    const averageRating = suppliers.length > 0
        ? (suppliers.reduce((sum, s) => sum + (s.rating || 3), 0) / suppliers.length).toFixed(1)
        : 0

    const openEditModal = (supplier) => {
        setEditingSupplier(supplier)
        setFormData(supplier)
        setShowModal(true)
    }

    const riskColors = { low: '#00874A', medium: '#F39200', high: '#E53E3E', critical: '#9B2C2C' }

    const riskData = summary ? [
        { name: 'Düşük', value: suppliers.filter(s => s.risk_level === 'low').length, color: riskColors.low },
        { name: 'Orta', value: suppliers.filter(s => s.risk_level === 'medium').length, color: riskColors.medium },
        { name: 'Yüksek', value: suppliers.filter(s => s.risk_level === 'high').length, color: riskColors.high },
    ] : []

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <a href="/">Dashboard</a>
                <span className="separator">/</span>
                <span className="current">{language === 'tr' ? 'Tedarikçiler' : 'Suppliers'}</span>
            </div>

            <div className="page-header">
                <div>
                    <h1>🏭 {language === 'tr' ? 'Tedarik Zinciri Yönetimi' : 'Supply Chain Management'}</h1>
                    <p className="text-muted">
                        {language === 'tr'
                            ? 'Tedarikçi emisyonlarını takip edin ve Scope 3 risklerini yönetin'
                            : 'Track supplier emissions and manage Scope 3 risks'}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setEditingSupplier(null); setShowModal(true) }}>
                    ➕ {language === 'tr' ? 'Yeni Tedarikçi' : 'New Supplier'}
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="stats-grid mb-4">
                    <div className="stat-card">
                        <div className="stat-icon blue">🏢</div>
                        <div className="stat-content">
                            <h4>{language === 'tr' ? 'Toplam Tedarikçi' : 'Total Suppliers'}</h4>
                            <div className="value">{summary.total_suppliers}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">🌿</div>
                        <div className="stat-content">
                            <h4>Scope 3 Emisyon</h4>
                            <div className="value">{summary.total_scope3_emissions?.toLocaleString()} tCO2e</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange">⚠️</div>
                        <div className="stat-content">
                            <h4>Yüksek Riskli</h4>
                            <div className="value">{summary.high_risk_count}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon danger">📋</div>
                        <div className="stat-content">
                            <h4>CBAM Hazır Değil</h4>
                            <div className="value">{summary.not_cbam_ready_count}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>⭐</div>
                        <div className="stat-content">
                            <h4>Ortalama Puan</h4>
                            <div className="value">
                                <Rating value={parseFloat(averageRating)} max={5} size="small" readOnly />
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}>{averageRating}/5</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="suppliers-layout">
                {/* Risk Chart */}
                <div className="card">
                    <div className="card-header"><span>📊</span> Risk Dağılımı</div>
                    <div className="card-body">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={riskData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                                    {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* DataTable with Filters */}
                <div className="card">
                    <div className="card-header">
                        <span>📋</span> Tedarikçi Listesi
                        <div className="header-actions">
                            <select
                                className="sort-dropdown"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="name">İsme Göre</option>
                                <option value="rating">Puana Göre</option>
                                <option value="emissions">Emisyona Göre</option>
                                <option value="risk">Riske Göre</option>
                            </select>
                            <div className="filter-tabs">
                                {[{ k: 'all', l: 'Tümü' }, { k: 'high_risk', l: 'Yüksek Risk' }, { k: 'not_ready', l: 'CBAM Hazır Değil' }, { k: 'verified', l: 'Doğrulanmış' }].map(f => (
                                    <button key={f.k} className={`filter-tab ${filter === f.k ? 'active' : ''}`} onClick={() => setFilter(f.k)}>{f.l}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <DataTable
                            columns={[
                                {
                                    key: 'name',
                                    label: 'Tedarikçi',
                                    render: (value, row) => (
                                        <div>
                                            <strong>{value}</strong>
                                            <br /><small className="text-muted">{row.sector}</small>
                                        </div>
                                    )
                                },
                                { key: 'country', label: 'Ülke' },
                                {
                                    key: 'annual_emissions',
                                    label: 'Emisyon',
                                    render: (value) => `${(value || 0).toLocaleString()} tCO2e`
                                },
                                {
                                    key: 'risk_level',
                                    label: 'Risk',
                                    render: (value) => (
                                        <Badge variant={value === 'high' ? 'danger' : value === 'medium' ? 'warning' : 'success'}>
                                            {value === 'high' ? 'Yüksek' : value === 'medium' ? 'Orta' : 'Düşük'}
                                        </Badge>
                                    )
                                },
                                {
                                    key: 'cbam_ready',
                                    label: 'CBAM',
                                    render: (value) => value ? <span className="text-green">✅ Hazır</span> : <span className="text-orange">⏳ Bekliyor</span>
                                },
                                {
                                    key: 'rating',
                                    label: 'Puan',
                                    render: (value, row) => (
                                        <Rating
                                            value={value || 3}
                                            max={5}
                                            size="small"
                                            onChange={(newRating) => handleRatingChange(row.id, newRating)}
                                        />
                                    )
                                },
                                {
                                    key: 'actions',
                                    label: 'İşlem',
                                    sortable: false,
                                    filterable: false,
                                    render: (_, row) => (
                                        <div className="action-buttons">
                                            <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); openEditModal(row); }}>✏️</button>
                                            {!row.verified && <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); handleVerify(row.id); }}>✓</button>}
                                            <button className="btn-icon-sm danger" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>🗑️</button>
                                        </div>
                                    )
                                }
                            ]}
                            data={sortedSuppliers}
                            pagination={true}
                            pageSize={10}
                            exportable={true}
                            selectable={false}
                            emptyMessage="Tedarikçi bulunamadı"
                        />
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingSupplier ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Tedarikçi Adı *</label>
                                    <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label>Ülke</label>
                                        <input value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Sektör</label>
                                        <input value={formData.sector} onChange={e => setFormData({ ...formData, sector: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label>Yıllık Emisyon (tCO2e)</label>
                                        <input type="number" value={formData.annual_emissions} onChange={e => setFormData({ ...formData, annual_emissions: Number(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Risk Seviyesi</label>
                                        <select value={formData.risk_level} onChange={e => setFormData({ ...formData, risk_level: e.target.value })}>
                                            <option value="low">Düşük</option>
                                            <option value="medium">Orta</option>
                                            <option value="high">Yüksek</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Floating Action Button */}
            <button className="fab" onClick={() => { resetForm(); setEditingSupplier(null); setShowModal(true) }} title="Yeni Tedarikçi Ekle">
                ➕
            </button>
        </div>
    )
}

export default Suppliers
