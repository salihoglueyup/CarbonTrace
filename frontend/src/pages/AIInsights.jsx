import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const AIInsights = () => {
    const { language } = useLanguage()
    const [recommendations, setRecommendations] = useState([])
    const [insights, setInsights] = useState([])
    const [anomalies, setAnomalies] = useState([])
    const [actionItems, setActionItems] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const t = {
        title: language === 'tr' ? 'AI Öngörüler' : 'AI Insights',
        subtitle: language === 'tr' ? 'Yapay zeka destekli öneriler ve analizler' : 'AI-powered recommendations and analysis',
        refresh: language === 'tr' ? 'Yenile' : 'Refresh',
        loading: language === 'tr' ? 'AI analiz yapıyor...' : 'AI is analyzing...',
        recommendations: language === 'tr' ? 'Kişiselleştirilmiş Öneriler' : 'Personalized Recommendations',
        emissionAnalysis: language === 'tr' ? 'Emisyon Analizleri' : 'Emission Analysis',
        anomalyDetection: language === 'tr' ? 'Anomali Tespiti' : 'Anomaly Detection',
        priorityActions: language === 'tr' ? 'Öncelikli Aksiyonlar' : 'Priority Actions',
        noAnomalies: language === 'tr' ? 'Anomali tespit edilmedi' : 'No anomalies detected',
        start: language === 'tr' ? 'Başla' : 'Start',
        critical: language === 'tr' ? 'Kritik' : 'Critical',
        medium: language === 'tr' ? 'Orta' : 'Medium',
        spike: language === 'tr' ? 'Ani Artış' : 'Spike',
        drop: language === 'tr' ? 'Ani Düşüş' : 'Drop',
        anomaly: language === 'tr' ? 'anomali' : 'anomalies',
        expectedRange: language === 'tr' ? 'Beklenen aralık' : 'Expected range',
    }

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const [recRes, insRes, anomRes, actRes] = await Promise.all([
                fetch('http://localhost:8000/api/recommendations/personalized?user_id=1'),
                fetch('http://localhost:8000/api/recommendations/insights'),
                fetch('http://localhost:8000/api/recommendations/anomalies'),
                fetch('http://localhost:8000/api/recommendations/action-items')
            ])

            const [recData, insData, anomData, actData] = await Promise.all([
                recRes.json(), insRes.json(), anomRes.json(), actRes.json()
            ])

            if (recData.success) setRecommendations(recData.recommendations)
            if (insData.success) setInsights(insData.insights)
            if (anomData.success) setAnomalies(anomData.anomalies)
            if (actData.success) setActionItems(actData.action_items)
        } catch (error) {
            console.error('Error fetching AI data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': case 1: return 'danger'
            case 'medium': case 2: return 'warning'
            default: return 'success'
        }
    }

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>{t.loading}</p>
            </div>
        )
    }

    return (
        <div className="ai-insights-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>🧠 {t.title}</h1>
                    <p className="text-muted">{t.subtitle}</p>
                </div>
                <button className="btn btn-primary" onClick={fetchAllData}>
                    🔄 {t.refresh}
                </button>
            </div>

            {/* Recommendations Grid */}
            <div className="ai-section">
                <h3>💡 {t.recommendations}</h3>
                <div className="recommendations-grid">
                    {recommendations.map(rec => (
                        <div
                            key={rec.id}
                            className={`rec-card priority-${rec.priority}`}
                            onClick={() => rec.action_url && navigate(rec.action_url)}
                        >
                            <span className="rec-icon">{rec.icon}</span>
                            <div className="rec-content">
                                <h4>{rec.title}</h4>
                                <p>{rec.description}</p>
                            </div>
                            {rec.action && (
                                <span className="rec-action">{rec.action} →</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="ai-two-col">
                {/* Insights */}
                <div className="ai-section">
                    <h3>📊 {t.emissionAnalysis}</h3>
                    <div className="insights-list">
                        {insights.map((insight, i) => (
                            <div key={i} className={`insight-card ${insight.type}`}>
                                <div className="insight-header">
                                    <span className="insight-icon">
                                        {insight.type === 'alert' ? '⚠️' : insight.direction === 'up' ? '📈' : '📉'}
                                    </span>
                                    <strong>{insight.title}</strong>
                                </div>
                                <p>{insight.message}</p>
                                <div className="insight-tip">
                                    💡 {insight.suggestion}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Anomalies */}
                <div className="ai-section">
                    <div className="section-header-with-badge">
                        <h3>🔍 {t.anomalyDetection}</h3>
                        {anomalies.length > 0 && (
                            <span className="badge-count">{anomalies.length}</span>
                        )}
                    </div>
                    <div className="anomalies-list">
                        {anomalies.length === 0 ? (
                            <div className="empty-anomalies">
                                <span>✅</span>
                                <p>{t.noAnomalies}</p>
                            </div>
                        ) : (
                            anomalies.map((anomaly, i) => (
                                <div key={i} className={`anomaly-card ${anomaly.severity}`}>
                                    <div className="anomaly-header">
                                        <span className="anomaly-type">
                                            {anomaly.type === 'spike' ? `📈 ${t.spike}` : `📉 ${t.drop}`}
                                        </span>
                                        <span className={`severity-tag ${anomaly.severity}`}>
                                            {anomaly.severity === 'high' ? t.critical : t.medium}
                                        </span>
                                    </div>
                                    <p><strong>{anomaly.date}:</strong> {anomaly.value.toLocaleString()} tCO2e</p>
                                    <small>{t.expectedRange}: {anomaly.expected_range}</small>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Action Items */}
            <div className="ai-section">
                <h3>✅ {t.priorityActions}</h3>
                <div className="action-items-grid">
                    {actionItems.map((action, i) => (
                        <div key={i} className="action-card">
                            <div className={`priority-num ${getPriorityColor(action.priority)}`}>
                                #{action.priority}
                            </div>
                            <div className="action-body">
                                <h4>{action.title}</h4>
                                <p>{action.description}</p>
                                <div className="action-tags">
                                    <span className="tag category">{action.category}</span>
                                    <span className="tag impact">💰 {action.estimated_impact}</span>
                                    <span className="tag deadline">📅 {action.deadline}</span>
                                </div>
                            </div>
                            <button className="btn-start">{t.start}</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AIInsights
