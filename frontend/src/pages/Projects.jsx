import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import KanbanBoard from '../components/KanbanBoard'
import { useLanguage } from '../contexts/LanguageContext'
import { projectsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const Projects = () => {
    const { language } = useLanguage()
    const { user } = useAuth()
    const [filter, setFilter] = useState('all')
    const [viewMode, setViewMode] = useState('grid') // 'grid' veya 'kanban'
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true)
                // Gerçek senaryoda user.companyId ile filtreleme yapılabilir
                const data = await projectsAPI.getAll(user?.company_id)
                setProjects(data)
            } catch (err) {
                console.error('Error fetching projects:', err)
                setError('Projeler yüklenirken bir hata oluştu.')
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [user])

    // Proje tipleri ve etiketleri (sabit kalabilir veya API'den gelebilir)
    const projectTypes = {
        'solar': { label: language === 'tr' ? 'Güneş Enerjisi' : 'Solar Energy', icon: '☀️', color: 'green' },
        'efficiency': { label: language === 'tr' ? 'Enerji Verimliliği' : 'Energy Efficiency', icon: '⚡', color: 'blue' },
        'fleet': { label: language === 'tr' ? 'Filo Dönüşümü' : 'Fleet Conversion', icon: '🚛', color: 'orange' },
        'carbon': { label: language === 'tr' ? 'Karbon Yakalama' : 'Carbon Capture', icon: '🌿', color: 'green' },
        'other': { label: language === 'tr' ? 'Diğer' : 'Other', icon: '📁', color: 'gray' }
    }

    const statusLabels = {
        'Planned': { label: language === 'tr' ? 'Planlama' : 'Planning', class: 'badge-info', id: 'planning' },
        'In Progress': { label: language === 'tr' ? 'Devam Ediyor' : 'In Progress', class: 'badge-success', id: 'active' },
        'Completed': { label: language === 'tr' ? 'Tamamlandı' : 'Completed', class: 'badge-primary', id: 'completed' },
        'On Hold': { label: language === 'tr' ? 'Beklemede' : 'On Hold', class: 'badge-warning', id: 'paused' },
        'Cancelled': { label: language === 'tr' ? 'İptal' : 'Cancelled', class: 'badge-danger', id: 'cancelled' }
    }

    // Status mapping for legacy/mixed data compatibility
    const normalizeStatus = (status) => {
        if (!status) return 'Planned'
        // Map lowercase or Turkish status to standard English keys
        const map = {
            'planning': 'Planned', 'planlama': 'Planned',
            'active': 'In Progress', 'devam ediyor': 'In Progress',
            'completed': 'Completed', 'tamamlandı': 'Completed',
            'paused': 'On Hold', 'beklemede': 'On Hold'
        }
        return map[status.toLowerCase()] || status
    }

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => normalizeStatus(p.status) === normalizeStatus(filter))

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    // spent alanı API'den gelmiyor olabilir, progress üzerinden tahmin edelim veya model'e eklenmeli
    // Şimdilik progress * budget olarak simüle edelim
    const totalSpent = projects.reduce((sum, p) => sum + ((p.budget || 0) * (p.progress || 0) / 100), 0)
    const totalSaving = projects.reduce((sum, p) => sum + (p.emission_reduction_Target || 0), 0)

    // Kanban columns
    const kanbanColumns = [
        { id: 'Planned', title: language === 'tr' ? 'Planlama' : 'Planning', color: '#3B82F6' },
        { id: 'In Progress', title: language === 'tr' ? 'Devam Ediyor' : 'In Progress', color: '#10B981' },
        { id: 'Completed', title: language === 'tr' ? 'Tamamlandı' : 'Completed', color: '#8B5CF6' },
        { id: 'On Hold', title: language === 'tr' ? 'Beklemede' : 'On Hold', color: '#F59E0B' }
    ]

    // Projeleri kanban kartlarına dönüştür
    const kanbanCards = projects.map(p => {
        const normalized = normalizeStatus(p.status)
        return {
            id: p.id,
            title: p.name,
            description: `€${((p.budget || 0) / 1000).toFixed(0)}K`,
            columnId: normalized,
            priority: (p.progress || 0) < 30 ? 'low' : (p.progress || 0) < 70 ? 'medium' : 'high',
            assignee: p.manager || 'Unassigned',
            dueDate: p.end_date,
            progress: p.progress || 0,
            type: p.description?.includes('solar') ? 'solar' : 'other' // Basit type tahmini
        }
    })

    const handleCardMove = async (cardId, newColumnId) => {
        try {
            // Optimistic update
            const updatedProjects = projects.map(p =>
                p.id === cardId ? { ...p, status: newColumnId } : p
            )
            setProjects(updatedProjects)

            // API call
            await projectsAPI.update(cardId, { status: newColumnId })
        } catch (err) {
            console.error('Error updating project status:', err)
            // Revert on error would be ideal here
        }
    }

    const handleCardClick = (card) => {
        console.log('Kart tıklandı:', card)
    }

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>
    if (error) return <div className="alert alert-error">{error}</div>

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <a href="/">Dashboard</a>
                <span className="separator">/</span>
                <span className="current">Projeler</span>
            </div>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>📁 Yeşil Projeler</h1>
                    <p className="text-muted">Emisyon azaltım projelerini takip edin</p>
                </div>
                <div className="header-actions">
                    {/* View Mode Toggle */}
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Kart Görünümü"
                        >
                            📊
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                            onClick={() => setViewMode('kanban')}
                            title="Kanban Görünümü"
                        >
                            📋
                        </button>
                    </div>
                    <button className="btn btn-primary">
                        <span>➕</span> Yeni Proje
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid mb-4">
                <div className="stat-card">
                    <div className="stat-icon green">📁</div>
                    <div className="stat-content">
                        <h4>Toplam Proje</h4>
                        <div className="value">{projects.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">💶</div>
                    <div className="stat-content">
                        <h4>Toplam Bütçe</h4>
                        <div className="value">€{(totalBudget / 1000000).toFixed(1)}M</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">📊</div>
                    <div className="stat-content">
                        <h4>Harcanan</h4>
                        <div className="value">€{(totalSpent / 1000000).toFixed(1)}M</div>
                        <div className="change">{Math.round((totalSpent / totalBudget) * 100)}% kullanıldı</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">🌿</div>
                    <div className="stat-content">
                        <h4>Beklenen Azaltım</h4>
                        <div className="value">{totalSaving.toLocaleString()} tCO2e</div>
                        <div className="change positive">yıllık</div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs mb-4">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Tümü ({projects.length})
                </button>
                <button
                    className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Devam Eden ({projects.filter(p => p.status === 'active').length})
                </button>
                <button
                    className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Tamamlanan ({projects.filter(p => p.status === 'completed').length})
                </button>
                <button
                    className={`filter-tab ${filter === 'planning' ? 'active' : ''}`}
                    onClick={() => setFilter('planning')}
                >
                    Planlanan ({projects.filter(p => p.status === 'planning').length})
                </button>
            </div>

            {/* Kanban or Grid View */}
            {
                viewMode === 'kanban' ? (
                    <div className="kanban-wrapper">
                        <KanbanBoard
                            columns={kanbanColumns}
                            cards={kanbanCards}
                            onCardMove={handleCardMove}
                            onCardClick={handleCardClick}
                        />
                    </div>
                ) : (
                    /* Projects Grid */
                    <div className="projects-grid">
                        {filteredProjects.map(project => {
                            const type = projectTypes[project.type]
                            const status = statusLabels[project.status]

                            return (
                                <div key={project.id} className="project-card">
                                    <div className="project-header">
                                        <div className={`project-type-icon ${type.color}`}>
                                            {type.icon}
                                        </div>
                                        <span className={`badge ${status.class}`}>{status.label}</span>
                                    </div>

                                    <h3>{project.name}</h3>
                                    <p className="project-company">{project.company}</p>

                                    <div className="project-progress">
                                        <div className="progress-header">
                                            <span>İlerleme</span>
                                            <span>{project.progress}%</span>
                                        </div>
                                        <div className="progress">
                                            <div
                                                className={`progress-bar ${type.color}`}
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="project-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Bütçe</span>
                                            <span className="metric-value">€{(project.budget / 1000).toFixed(0)}K</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Harcanan</span>
                                            <span className="metric-value">€{(project.spent / 1000).toFixed(0)}K</span>
                                        </div>
                                        <div className="metric highlight">
                                            <span className="metric-label">CO2 Azaltım</span>
                                            <span className="metric-value">{project.expectedSaving} tCO2e/yıl</span>
                                        </div>
                                    </div>

                                    <div className="project-dates">
                                        <span>📅 {new Date(project.startDate).toLocaleDateString('tr-TR')} - {new Date(project.endDate).toLocaleDateString('tr-TR')}</span>
                                    </div>

                                    <button className="btn btn-outline btn-sm btn-block">
                                        Detayları Gör
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )
            }
        </div >
    )
}

export default Projects
