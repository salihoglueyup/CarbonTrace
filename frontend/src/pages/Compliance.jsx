import { useState, useEffect } from 'react'
import Badge from '../components/Badge'
import { useLanguage } from '../contexts/LanguageContext'
import { complianceAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const Compliance = () => {
    const { language } = useLanguage()
    const { user } = useAuth()
    const [checklist, setChecklist] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedCategory, setExpandedCategory] = useState(null)

    useEffect(() => {
        const fetchStatus = async () => {
            if (!user?.company_id) return

            try {
                setLoading(true)
                const data = await complianceAPI.getStatus(user.company_id)
                // data format: [{ item: {id, ...}, status: {is_completed, ...} }, ...]

                // Group by category
                const grouped = data.reduce((acc, curr) => {
                    const cat = curr.item.category
                    if (!acc[cat]) {
                        acc[cat] = []
                    }
                    acc[cat].push({
                        ...curr.item,
                        completed: curr.status?.is_completed || false,
                        completed_at: curr.status?.completed_at,
                        notes: curr.status?.notes
                    })
                    return acc
                }, {})

                // Convert to array format expected by UI
                const categories = [
                    { id: 'Registration', icon: '📋', nameTr: 'Kayıt ve Raporlama', nameEn: 'Registration and Reporting' },
                    { id: 'Emission', icon: '🌿', nameTr: 'Emisyon Verileri', nameEn: 'Emission Data' },
                    { id: 'Supplier', icon: '🏭', nameTr: 'Tedarikçi Uyumu', nameEn: 'Supplier Compliance' },
                    { id: 'Financial', icon: '💰', nameTr: 'Finansal Hazırlık', nameEn: 'Financial Preparation' },
                    { id: 'Certification', icon: '🏆', nameTr: 'Sertifika ve Onay', nameEn: 'Certification and Approval' },
                ]

                const formattedList = categories.map(cat => ({
                    id: cat.id,
                    category: language === 'tr' ? cat.nameTr : cat.nameEn,
                    icon: cat.icon,
                    items: (grouped[cat.id] || []).map(item => ({
                        id: item.id,
                        text: language === 'tr' ? item.title_tr : item.title,
                        completed: item.completed,
                        deadline: item.deadline, // ISO string
                        priority: item.priority.toLowerCase() // High -> high
                    }))
                }))

                setChecklist(formattedList)
            } catch (err) {
                console.error('Error fetching compliance status:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchStatus()
    }, [user, language])

    const toggleItem = async (categoryId, itemId) => {
        // Optimistic update
        const updatedChecklist = checklist.map(cat => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    items: cat.items.map(item => {
                        if (item.id === itemId) {
                            return { ...item, completed: !item.completed }
                        }
                        return item
                    })
                }
            }
            return cat
        })

        setChecklist(updatedChecklist)

        // Find new status
        const category = updatedChecklist.find(c => c.id === categoryId)
        const item = category.items.find(i => i.id === itemId)

        if (item && user?.company_id) {
            try {
                await complianceAPI.updateStatus(itemId, user.company_id, {
                    is_completed: item.completed,
                    notes: ""
                })
            } catch (err) {
                console.error("Error updating status:", err)
                // Revert on error could be implemented here
            }
        }
    }

    const totalItems = checklist.reduce((sum, cat) => sum + cat.items.length, 0)
    const completedItems = checklist.reduce((sum, cat) => sum + cat.items.filter(i => i.completed).length, 0)
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    const getPriorityBadge = (priority) => {
        const labels = {
            high: language === 'tr' ? 'Yüksek' : 'High',
            medium: language === 'tr' ? 'Orta' : 'Medium',
            low: language === 'tr' ? 'Düşük' : 'Low'
        }
        const colors = { high: 'danger', medium: 'warning', low: 'success' }
        return <Badge size="sm" variant={colors[priority] || 'primary'}>{labels[priority] || priority}</Badge>
    }

    if (loading) {
        return <div className="loading-container"><div className="loading-spinner"></div></div>
    }

    return (
        <div className="compliance-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>✅ {language === 'tr' ? 'CBAM Uyumluluk' : 'CBAM Compliance'}</h1>
                    <p className="text-muted">
                        {language === 'tr'
                            ? 'AB CBAM gereksinimlerini takip edin'
                            : 'Track EU CBAM requirements'}
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="compliance-summary">
                <div className="summary-card">
                    <div className="summary-icon">📊</div>
                    <div className="summary-content">
                        <span className="summary-value">{completionRate}%</span>
                        <span className="summary-label">{language === 'tr' ? 'Tamamlandı' : 'Completed'}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">✅</div>
                    <div className="summary-content">
                        <span className="summary-value">{completedItems}</span>
                        <span className="summary-label">{language === 'tr' ? 'Biten Görev' : 'Done'}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">⏳</div>
                    <div className="summary-content">
                        <span className="summary-value">{totalItems - completedItems}</span>
                        <span className="summary-label">{language === 'tr' ? 'Bekleyen' : 'Pending'}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">📁</div>
                    <div className="summary-content">
                        <span className="summary-value">{checklist.length}</span>
                        <span className="summary-label">{language === 'tr' ? 'Kategori' : 'Categories'}</span>
                    </div>
                </div>
            </div>

            {/* Category Cards */}
            <div className="compliance-categories">
                {checklist.map(category => {
                    const catCompleted = category.items.filter(i => i.completed).length
                    const catTotal = category.items.length
                    const catPercent = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0
                    const isExpanded = expandedCategory === category.id

                    return (
                        <div key={category.id} className={`category-card ${isExpanded ? 'expanded' : ''}`}>
                            <div
                                className="category-header"
                                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                            >
                                <div className="category-info">
                                    <span className="category-icon">{category.icon}</span>
                                    <div>
                                        <h3>{category.category}</h3>
                                        <span className="category-progress">{catCompleted}/{catTotal} {language === 'tr' ? 'tamamlandı' : 'completed'}</span>
                                    </div>
                                </div>
                                <div className="category-right">
                                    <div className="mini-progress">
                                        <div className="mini-progress-bar" style={{ width: `${catPercent}%` }}></div>
                                    </div>
                                    <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="category-items">
                                    {category.items.map(item => (
                                        <div
                                            key={item.id}
                                            className={`task-item ${item.completed ? 'completed' : ''}`}
                                            onClick={() => toggleItem(category.id, item.id)}
                                        >
                                            <div className={`task-checkbox ${item.completed ? 'checked' : ''}`}>
                                                {item.completed && '✓'}
                                            </div>
                                            <div className="task-content">
                                                <span className="task-text">{item.text}</span>
                                                <div className="task-meta">
                                                    {getPriorityBadge(item.priority)}
                                                    <span className="task-date">
                                                        📅 {item.deadline ? new Date(item.deadline).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US') : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Timeline */}
            <div className="compliance-timeline">
                <h2>📆 {language === 'tr' ? 'CBAM Takvimi' : 'CBAM Timeline'}</h2>
                <div className="timeline-track">
                    <div className="timeline-step completed">
                        <div className="step-marker">✓</div>
                        <div className="step-content">
                            <strong>{language === 'tr' ? 'Ekim 2023' : 'Oct 2023'}</strong>
                            <span>{language === 'tr' ? 'Geçiş dönemi başladı' : 'Transition period started'}</span>
                        </div>
                    </div>
                    <div className="timeline-step completed">
                        <div className="step-marker">✓</div>
                        <div className="step-content">
                            <strong>{language === 'tr' ? 'Ocak 2024' : 'Jan 2024'}</strong>
                            <span>{language === 'tr' ? 'İlk rapor teslimi' : 'First report submission'}</span>
                        </div>
                    </div>
                    <div className="timeline-step active">
                        <div className="step-marker">◉</div>
                        <div className="step-content">
                            <strong>2024-2025</strong>
                            <span>{language === 'tr' ? 'Geçiş dönemi' : 'Transition period'}</span>
                        </div>
                    </div>
                    <div className="timeline-step">
                        <div className="step-marker"></div>
                        <div className="step-content">
                            <strong>{language === 'tr' ? 'Ocak 2026' : 'Jan 2026'}</strong>
                            <span>{language === 'tr' ? 'Kademeli uygulama' : 'Phased implementation'}</span>
                        </div>
                    </div>
                    <div className="timeline-step">
                        <div className="step-marker"></div>
                        <div className="step-content">
                            <strong>2034</strong>
                            <span>{language === 'tr' ? 'Tam uygulama' : 'Full implementation'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Compliance
