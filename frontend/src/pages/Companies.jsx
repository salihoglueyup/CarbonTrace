import { useState, useEffect } from 'react'
import { companiesAPI } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useLanguage } from '../contexts/LanguageContext'
import ConfirmDialog from '../components/ConfirmDialog'
import DataTable from '../components/DataTable'
import Avatar from '../components/Avatar'
import Badge from '../components/Badge'

const Companies = () => {
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [editingCompany, setEditingCompany] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' })
    const [deleting, setDeleting] = useState(false)
    const toast = useToast()
    const { t, language } = useLanguage()

    useEffect(() => {
        fetchCompanies()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchCompanies = async () => {
        try {
            setLoading(true)
            const data = await companiesAPI.getAll()
            setCompanies(data)
        } catch (err) {
            setError('Şirketler yüklenirken hata oluştu')
            toast.error('Şirketler yüklenirken hata oluştu')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteClick = (company) => {
        setDeleteConfirm({ open: true, id: company.id, name: company.name })
    }

    const handleDeleteConfirm = async () => {
        try {
            setDeleting(true)
            await companiesAPI.delete(deleteConfirm.id)
            setCompanies(companies.filter(c => c.id !== deleteConfirm.id))
            toast.success(`${deleteConfirm.name} başarıyla silindi`)
            setDeleteConfirm({ open: false, id: null, name: '' })
        } catch {
            toast.error('Silme işlemi başarısız')
        } finally {
            setDeleting(false)
        }
    }

    const openEditModal = (company) => {
        setEditingCompany(company)
        setShowModal(true)
    }

    const openNewModal = () => {
        setEditingCompany(null)
        setShowModal(true)
    }

    const getRiskBadge = (emissions) => {
        const texts = {
            critical: language === 'tr' ? 'Kritik' : 'Critical',
            high: language === 'tr' ? 'Yüksek' : 'High',
            medium: language === 'tr' ? 'Orta' : 'Medium',
            low: language === 'tr' ? 'Düşük' : 'Low'
        }
        if (emissions > 100000) return { class: 'status-pill danger', text: texts.critical }
        if (emissions > 50000) return { class: 'status-pill warning', text: texts.high }
        if (emissions > 20000) return { class: 'status-pill info', text: texts.medium }
        return { class: 'status-pill success', text: texts.low }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{language === 'tr' ? 'Şirketler yükleniyor...' : 'Loading companies...'}</p>
            </div>
        )
    }

    return (
        <>
            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Şirketi Sil"
                message={`"${deleteConfirm.name}" şirketini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
                confirmText="Sil"
                cancelText="İptal"
                variant="danger"
                loading={deleting}
            />

            <div>
                {/* Breadcrumbs */}
                <div className="breadcrumbs">
                    <a href="/">{t('nav.dashboard')}</a>
                    <span className="separator">/</span>
                    <span className="current">{t('nav.companies')}</span>
                </div>

                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>🏢 {t('nav.companies')}</h1>
                        <p className="text-muted">
                            {language === 'tr' ? 'CBAM kapsamındaki şirketleri yönetin' : 'Manage companies under CBAM scope'}
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={openNewModal}>
                        <span>➕</span> {language === 'tr' ? 'Yeni Şirket' : 'New Company'}
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error mb-4">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Companies DataTable */}
                <div className="card">
                    <DataTable
                        columns={[
                            {
                                key: 'name',
                                label: 'Şirket',
                                sortable: true,
                                filterable: true,
                                render: (value, row) => (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Avatar name={row.name} size="sm" />
                                        <div>
                                            <strong>{row.name}</strong>
                                            <div className="text-muted text-xs">{row.tax_number}</div>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                key: 'sector',
                                label: 'Sektör',
                                sortable: true,
                                filterable: true,
                                render: (value) => value || '-'
                            },
                            {
                                key: 'city',
                                label: 'Şehir',
                                sortable: true,
                                filterable: true,
                                render: (value) => value || '-'
                            },
                            {
                                key: 'employee_count',
                                label: 'Çalışan',
                                sortable: true,
                                render: (value) => value?.toLocaleString() || '-'
                            },
                            {
                                key: 'annual_eu_export',
                                label: 'AB İhracat',
                                sortable: true,
                                render: (value) => `€${(value || 0).toLocaleString()}`
                            },
                            {
                                key: 'total_emissions',
                                label: 'Toplam Emisyon',
                                sortable: true,
                                render: (value) => `${(value || 0).toLocaleString()} tCO2e`
                            },
                            {
                                key: 'risk',
                                label: 'Risk',
                                sortable: false,
                                filterable: false,
                                render: (_, row) => {
                                    const risk = getRiskBadge(row.total_emissions || 0)
                                    return (
                                        <Badge variant={risk.text === 'Kritik' ? 'danger' : risk.text === 'Yüksek' ? 'warning' : risk.text === 'Orta' ? 'info' : 'success'}>
                                            {risk.text}
                                        </Badge>
                                    )
                                }
                            },
                            {
                                key: 'actions',
                                label: 'İşlemler',
                                sortable: false,
                                filterable: false,
                                render: (_, row) => (
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openEditModal(row)
                                            }}
                                            title="Düzenle"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-icon danger"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteClick(row)
                                            }}
                                            title="Sil"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )
                            }
                        ]}
                        data={companies}
                        pagination={true}
                        pageSize={10}
                        selectable={false}
                        exportable={true}
                        loading={loading}
                        emptyMessage="Henüz şirket eklenmemiş"
                    />
                </div>

                {/* Stats Cards */}
                <div className="stats-grid mt-4">
                    <div className="stat-card">
                        <div className="stat-icon green">🏢</div>
                        <div className="stat-content">
                            <h4>Toplam Şirket</h4>
                            <div className="value">{companies.length}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blue">🌍</div>
                        <div className="stat-content">
                            <h4>Toplam AB İhracat</h4>
                            <div className="value">
                                €{companies.reduce((sum, c) => sum + (c.annual_eu_export || 0), 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange">🌿</div>
                        <div className="stat-content">
                            <h4>Toplam Emisyon</h4>
                            <div className="value">
                                {companies.reduce((sum, c) => sum + (c.total_emissions || 0), 0).toLocaleString()} tCO2e
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Action Button */}
                <button className="fab" onClick={openNewModal} title="Yeni Şirket Ekle">
                    ➕
                </button>

                {/* Modal */}
                {showModal && (
                    <CompanyModal
                        company={editingCompany}
                        onClose={() => setShowModal(false)}
                        onSave={() => {
                            setShowModal(false)
                            fetchCompanies()
                            toast.success(editingCompany ? 'Şirket güncellendi' : 'Yeni şirket eklendi')
                        }}
                    />
                )}
            </div>
        </>
    )
}

// Company Modal Component
const CompanyModal = ({ company, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: company?.name || '',
        tax_number: company?.tax_number || '',
        sector: company?.sector || '',
        sub_sector: company?.sub_sector || '',
        city: company?.city || '',
        employee_count: company?.employee_count || 0,
        annual_revenue: company?.annual_revenue || 0,
        annual_eu_export: company?.annual_eu_export || 0
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        try {
            if (company) {
                await companiesAPI.update(company.id, formData)
            } else {
                await companiesAPI.create(formData)
            }
            onSave()
        } catch (err) {
            setError(err.response?.data?.detail || 'İşlem başarısız')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{company ? '✏️ Şirket Düzenle' : '➕ Yeni Şirket'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-error mb-4">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Şirket Adı *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Vergi No</label>
                                <input
                                    type="text"
                                    name="tax_number"
                                    value={formData.tax_number}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Sektör</label>
                                <select name="sector" value={formData.sector} onChange={handleChange}>
                                    <option value="">Seçin...</option>
                                    <option value="Demir-Çelik">Demir-Çelik</option>
                                    <option value="Alüminyum">Alüminyum</option>
                                    <option value="Çimento">Çimento</option>
                                    <option value="Gübre">Gübre</option>
                                    <option value="Hidrojen">Hidrojen</option>
                                    <option value="Elektrik">Elektrik</option>
                                    <option value="Kimya">Kimya</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Alt Sektör</label>
                                <input
                                    type="text"
                                    name="sub_sector"
                                    value={formData.sub_sector}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Şehir</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Çalışan Sayısı</label>
                                <input
                                    type="number"
                                    name="employee_count"
                                    value={formData.employee_count}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Yıllık Gelir (€)</label>
                                <input
                                    type="number"
                                    name="annual_revenue"
                                    value={formData.annual_revenue}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>AB İhracat (€)</label>
                                <input
                                    type="number"
                                    name="annual_eu_export"
                                    value={formData.annual_eu_export}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            İptal
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Companies
