import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../components/Badge'
import DatePicker from '../components/DatePicker'
import { useLanguage } from '../contexts/LanguageContext'
import { reportsAPI } from '../services/api'

const Reports = () => {
    const { language } = useLanguage()
    const [selectedType, setSelectedType] = useState('all')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true)
            const data = await reportsAPI.getAll()
            // Transform API data to match UI needs
            const formattedReports = data.map(r => ({
                id: r.id,
                title: r.type === 'EMISSION' ? (language === 'tr' ? 'Emisyon Raporu' : 'Emission Report') :
                    r.type === 'CBAM' ? (language === 'tr' ? 'CBAM Raporu' : 'CBAM Report') : r.type,
                type: r.type.toLowerCase(),
                date: r.generated_date,
                status: 'ready', // API doesn't return status yet, assume ready
                size: '1.2 MB', // Mock size
                icon: r.type === 'EMISSION' ? '🌿' : r.type === 'CBAM' ? '💰' : '📊'
            }))
            setReports(formattedReports)
        } catch (err) {
            console.error('Error fetching reports:', err)
        } finally {
            setLoading(false)
        }
    }, [language])

    useEffect(() => {
        fetchReports()
    }, [fetchReports])

    const reportTypes = language === 'tr' ? [
        { id: 'all', label: 'Tümü' },
        { id: 'emission', label: 'Emisyon' },
        { id: 'cbam', label: 'CBAM' },
        { id: 'financial', label: 'Finansal' },
    ] : [
        { id: 'all', label: 'All' },
        { id: 'emission', label: 'Emission' },
        { id: 'cbam', label: 'CBAM' },
        { id: 'financial', label: 'Financial' },
    ]

    const filteredReports = selectedType === 'all'
        ? reports
        : reports.filter(r => r.type === selectedType)

    const handleExport = (format, id) => {
        // In a real app, this would trigger a file download from the API
        alert(language === 'tr'
            ? `${format.toUpperCase()} formatında indirme başlatılıyor... (ID: ${id})`
            : `Starting download in ${format.toUpperCase()} format... (ID: ${id})`)
    }

    const handleGenerateReport = async (type = 'EMISSION') => {
        try {
            setLoading(true)
            await reportsAPI.create({
                type: type,
                parameters: { period: '2024' } // Example params
            })
            await fetchReports() // Refresh list
            alert(language === 'tr' ? 'Rapor başarıyla oluşturuldu.' : 'Report created successfully.')
        } catch (err) {
            console.error('Create report error:', err)
            alert(language === 'tr' ? 'Rapor oluşturulurken hata oluştu.' : 'Error creating report.')
        } finally {
            setLoading(false)
        }
    }

    if (loading && reports.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{language === 'tr' ? 'Raporlar yükleniyor...' : 'Loading reports...'}</p>
            </div>
        )
    }

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <a href="/">Dashboard</a>
                <span className="separator">/</span>
                <span className="current">{language === 'tr' ? 'Raporlar' : 'Reports'}</span>
            </div>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>📋 {language === 'tr' ? 'Raporlar' : 'Reports'}</h1>
                    <p className="text-muted">
                        {language === 'tr' ? 'CBAM ve emisyon raporlarınızı yönetin' : 'Manage your CBAM and emission reports'}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => handleGenerateReport('EMISSION')}>
                    <span>➕</span> {language === 'tr' ? 'Yeni Rapor Oluştur' : 'Create New Report'}
                </button>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid mb-4">
                <div className="stat-card">
                    <div className="stat-icon green">📊</div>
                    <div className="stat-content">
                        <h4>{language === 'tr' ? 'Toplam Rapor' : 'Total Reports'}</h4>
                        <div className="value">{reports.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">✅</div>
                    <div className="stat-content">
                        <h4>{language === 'tr' ? 'Hazır' : 'Ready'}</h4>
                        <div className="value">{reports.filter(r => r.status === 'ready').length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">⏳</div>
                    <div className="stat-content">
                        <h4>{language === 'tr' ? 'İşleniyor' : 'Processing'}</h4>
                        <div className="value">{reports.filter(r => r.status === 'processing').length}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="filters-row">
                        <div className="filter-tabs">
                            {reportTypes.map(type => (
                                <button
                                    key={type.id}
                                    className={`filter-tab ${selectedType === type.id ? 'active' : ''}`}
                                    onClick={() => setSelectedType(type.id)}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                        <div className="date-filters" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                            <DatePicker
                                label="Başlangıç"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                placeholder="Tarih seç"
                            />
                            <DatePicker
                                label="Bitiş"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                placeholder="Tarih seç"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="card">
                <div className="card-header">
                    <span>📁</span> Raporlar ({filteredReports.length})
                </div>
                <div className="reports-list">
                    {filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📭</span>
                            <h3>{language === 'tr' ? 'Rapor bulunamadı' : 'No reports found'}</h3>
                            <p>{language === 'tr' ? 'Seçili filtrelere uygun rapor yok' : 'No reports match selected filters'}</p>
                        </div>
                    ) : (
                        filteredReports.map(report => (
                            <div key={report.id} className="report-item">
                                <div className="report-icon">{report.icon}</div>
                                <div className="report-info">
                                    <h4>{report.title}</h4>
                                    <div className="report-meta">
                                        <span>{new Date(report.date).toLocaleDateString('tr-TR')}</span>
                                        <span>•</span>
                                        <span>{report.size}</span>
                                        <Badge variant={report.status === 'ready' ? 'success' : 'warning'}>
                                            {report.status === 'ready' ? (language === 'tr' ? '✓ Hazır' : '✓ Ready') : (language === 'tr' ? '⏳ İşleniyor' : '⏳ Processing')}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="report-actions">
                                    {report.status === 'ready' ? (
                                        <>
                                            <button
                                                className="export-btn pdf"
                                                onClick={() => handleExport('pdf', report.id)}
                                                title="PDF İndir"
                                            >
                                                📄 PDF
                                            </button>
                                            <button
                                                className="export-btn excel"
                                                onClick={() => handleExport('excel', report.id)}
                                                title="Excel İndir"
                                            >
                                                📊 Excel
                                            </button>
                                        </>
                                    ) : (
                                        <span className="processing-text">{language === 'tr' ? 'İşleniyor...' : 'Processing...'}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Report Templates */}
            <div className="report-templates mt-4">
                <h3>📝 {language === 'tr' ? 'Rapor Şablonları' : 'Report Templates'}</h3>
                <div className="templates-grid">
                    <div className="template-card">
                        <span className="template-icon">🌿</span>
                        <h4>{language === 'tr' ? 'Emisyon Raporu' : 'Emission Report'}</h4>
                        <p>{language === 'tr' ? 'Scope 1, 2, 3 emisyon detayları' : 'Scope 1, 2, 3 emission details'}</p>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleGenerateReport('EMISSION')}>{language === 'tr' ? 'Oluştur' : 'Create'}</button>
                    </div>
                    <div className="template-card">
                        <span className="template-icon">💰</span>
                        <h4>{language === 'tr' ? 'CBAM Maliyet Raporu' : 'CBAM Cost Report'}</h4>
                        <p>{language === 'tr' ? 'Maliyet projeksiyonu ve senaryo analizi' : 'Cost projection and scenario analysis'}</p>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleGenerateReport('CBAM')}>{language === 'tr' ? 'Oluştur' : 'Create'}</button>
                    </div>
                    <div className="template-card">
                        <span className="template-icon">📊</span>
                        <h4>{language === 'tr' ? 'Karşılaştırmalı Analiz' : 'Comparative Analysis'}</h4>
                        <p>{language === 'tr' ? 'Sektör ve dönem karşılaştırmaları' : 'Sector and period comparisons'}</p>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleGenerateReport('FINANCIAL')}>{language === 'tr' ? 'Oluştur' : 'Create'}</button>
                    </div>
                    <div className="template-card">
                        <span className="template-icon">🎯</span>
                        <h4>{language === 'tr' ? 'Hedef İzleme Raporu' : 'Target Tracking Report'}</h4>
                        <p>{language === 'tr' ? 'Emisyon azaltım hedefleri takibi' : 'Emission reduction targets tracking'}</p>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleGenerateReport('EMISSION')}>{language === 'tr' ? 'Oluştur' : 'Create'}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Reports
