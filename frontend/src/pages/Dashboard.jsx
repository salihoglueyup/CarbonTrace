import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import KPICard from '../components/KPICard'
import ActivityFeed from '../components/ActivityFeed'
import { Countdown } from '../components/InteractiveUI'
import MarketTicker from '../components/MarketTicker'
import NewsFeed from '../components/NewsFeed'
import { dashboardAPI } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

// Fallback sample activities for ActivityFeed
const sampleActivities = [
    { id: 1, user: 'Ahmet Yılmaz', action: 'emisyon verilerini güncelledi', target: 'Anadolu Demir Çelik', time: '5 dk önce', type: 'emission', isNew: true },
    { id: 2, user: 'Mehmet Kaya', action: 'CBAM raporu oluşturdu', target: 'Q4 2024', time: '15 dk önce', type: 'report' },
    { id: 3, user: 'Ayşe Demir', action: 'yeni tedarikçi ekledi', target: 'Ege Alüminyum', time: '1 saat önce', type: 'create' },
    { id: 4, user: 'Fatma Öz', action: 'doküman yükledi', target: 'ISO-14064.pdf', time: '2 saat önce', type: 'upload' },
    { id: 5, user: 'Ali Veli', action: 'risk analizini tamamladı', target: 'Marmara Çimento', time: '3 saat önce', type: 'system' },
    { id: 6, user: 'Zeynep Ak', action: 'yeşil kredi başvurusu yaptı', target: '€2.5M', time: '4 saat önce', type: 'create' },
]

// Chart data (can be fetched from API later)
const emissionTrendData = [
    { month: 'Oca', emissions: 32000, target: 30000 },
    { month: 'Şub', emissions: 30500, target: 29500 },
    { month: 'Mar', emissions: 29800, target: 29000 },
    { month: 'Nis', emissions: 28500, target: 28500 },
    { month: 'May', emissions: 27200, target: 28000 },
    { month: 'Haz', emissions: 26800, target: 27500 },
    { month: 'Tem', emissions: 25500, target: 27000 },
    { month: 'Ağu', emissions: 24800, target: 26500 },
    { month: 'Eyl', emissions: 24200, target: 26000 },
    { month: 'Eki', emissions: 23800, target: 25500 },
    { month: 'Kas', emissions: 23500, target: 25000 },
    { month: 'Ara', emissions: 24100, target: 24500 },
]

const cbamCostForecast = [
    { year: '2024', cost: 0, label: 'Raporlama' },
    { year: '2025', cost: 0, label: 'Raporlama' },
    { year: '2026', cost: 5.8, label: '22.5%' },
    { year: '2027', cost: 7.2, label: '33.7%' },
    { year: '2028', cost: 8.5, label: '44.9%' },
    { year: '2029', cost: 9.8, label: '56.2%' },
    { year: '2030', cost: 11.2, label: '67.4%' },
]

const COLORS = ['#00874A', '#004481', '#F39200', '#1464A5', '#00A85A']

// Default widget order
const DEFAULT_WIDGET_ORDER = ['companies', 'emissions', 'cbamCost', 'highRisk']

const Dashboard = () => {
    // State for API data
    const [stats, setStats] = useState({
        total_companies: 0,
        total_emissions: 0,
        estimated_cbam_cost: 0,
        high_risk_count: 0
    })
    const [companies, setCompanies] = useState([])
    const [emissionTrend, setEmissionTrend] = useState([])
    const [cbamProjection, setCbamProjection] = useState([])
    const [recentActivities, setRecentActivities] = useState(sampleActivities)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // i18n
    const { t, language } = useLanguage()

    // Widget ordering state
    const [widgetOrder, setWidgetOrder] = useState(() => {
        const saved = localStorage.getItem('dashboard-widget-order')
        return saved ? JSON.parse(saved) : DEFAULT_WIDGET_ORDER
    })
    const [draggedWidget, setDraggedWidget] = useState(null)
    const [isEditMode, setIsEditMode] = useState(false)

    // Save widget order to localStorage
    useEffect(() => {
        localStorage.setItem('dashboard-widget-order', JSON.stringify(widgetOrder))
    }, [widgetOrder])

    // Drag handlers
    const handleDragStart = useCallback((e, widgetId) => {
        setDraggedWidget(widgetId)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', widgetId)
    }, [])

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }, [])

    const handleDrop = useCallback((e, targetWidgetId) => {
        e.preventDefault()
        if (!draggedWidget || draggedWidget === targetWidgetId) return

        setWidgetOrder(prev => {
            const newOrder = [...prev]
            const dragIndex = newOrder.indexOf(draggedWidget)
            const dropIndex = newOrder.indexOf(targetWidgetId)

            if (dragIndex !== -1 && dropIndex !== -1) {
                newOrder.splice(dragIndex, 1)
                newOrder.splice(dropIndex, 0, draggedWidget)
            }
            return newOrder
        })
        setDraggedWidget(null)
    }, [draggedWidget])

    const handleDragEnd = useCallback(() => {
        setDraggedWidget(null)
    }, [])

    const resetWidgetOrder = useCallback(() => {
        setWidgetOrder(DEFAULT_WIDGET_ORDER)
    }, [])

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch all data in parallel
                const [statsData, companiesData, trendData, projectionData, activitiesData] = await Promise.all([
                    dashboardAPI.getStats(),
                    dashboardAPI.getCompanySummary(),
                    dashboardAPI.getEmissionTrend().catch(() => []),
                    dashboardAPI.getCbamProjection().catch(() => []),
                    dashboardAPI.getRecentActivities().catch(() => [])
                ])

                setStats(statsData)
                setCompanies(companiesData)

                // Transform emission trend data for chart
                if (trendData.length > 0) {
                    const chartData = trendData.map(item => ({
                        year: item.year.toString(),
                        emissions: item.total,
                        target: item.total * 0.9 // 10% reduction target
                    }))
                    setEmissionTrend(chartData)
                }

                // Transform CBAM projection for chart
                if (projectionData.length > 0) {
                    const cbamData = projectionData.map(item => ({
                        year: item.year.toString(),
                        cost: Math.round(item.cost / 1000000), // Convert to millions
                        label: `${Math.round(item.rate * 100)}%`
                    }))
                    setCbamProjection(cbamData)
                }

                // Set activities
                if (activitiesData.length > 0) {
                    setRecentActivities(activitiesData.map(a => ({
                        id: a.id,
                        user: 'Sistem',
                        action: a.message,
                        target: '',
                        time: a.timestamp,
                        type: a.type
                    })))
                }
            } catch (err) {
                console.error('Dashboard fetch error:', err)
                setError('Veriler yüklenirken bir hata oluştu')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    // Generate sector distribution from companies
    const sectorDistributionData = companies.reduce((acc, company) => {
        const existing = acc.find(item => item.name === company.sector)
        if (existing) {
            existing.value += company.emissions
        } else {
            acc.push({
                name: company.sector,
                value: company.emissions,
                color: COLORS[acc.length % COLORS.length]
            })
        }
        return acc
    }, [])

    const currentHour = new Date().getHours()
    const greeting = currentHour < 12 ? 'Günaydın' : currentHour < 18 ? 'İyi günler' : 'İyi akşamlar'

    // Format large numbers
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K'
        return num.toLocaleString('tr-TR')
    }

    return (
        <div>
            {/* Loading State with Skeleton */}
            {loading && (
                <div className="skeleton-dashboard">
                    {/* Skeleton Stats Grid */}
                    <div className="skeleton-stats-grid">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="skeleton-stat-card skeleton"></div>
                        ))}
                    </div>
                    {/* Skeleton Chart */}
                    <div className="skeleton-chart skeleton" style={{ marginTop: '1.5rem', height: '250px' }}></div>
                    {/* Skeleton Activity */}
                    <div className="skeleton-card skeleton" style={{ marginTop: '1.5rem', height: '200px' }}></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="alert alert-danger" style={{ margin: '1rem 0' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Welcome Banner */}
            <div className="welcome-banner">
                <div className="welcome-content">
                    <div className="welcome-text">
                        <h1>{greeting}! 👋</h1>
                        <p>CBAM Guard Dashboard'a hoş geldiniz. Günlük özetinize göz atın.</p>
                    </div>
                    <div className="welcome-actions">
                        <button className="btn btn-primary btn-glow">
                            <span>📊</span> Rapor Oluştur
                        </button>
                        <button className="btn btn-outline">
                            <span>🔔</span> 3 Bildirim
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Draggable KPI Widgets */}
            <div className="stats-grid-header">
                <h3>{language === 'tr' ? '📊 KPI Özeti' : '📊 KPI Summary'}</h3>
                <div className="widget-controls">
                    <button
                        className={`edit-mode-btn ${isEditMode ? 'active' : ''}`}
                        onClick={() => setIsEditMode(!isEditMode)}
                        title={isEditMode ? 'Done editing' : 'Reorder widgets'}
                    >
                        {isEditMode ? '✓' : '⚙️'}
                    </button>
                    {isEditMode && (
                        <button
                            className="reset-order-btn"
                            onClick={resetWidgetOrder}
                            title="Reset to default order"
                        >
                            🔄
                        </button>
                    )}
                </div>
            </div>
            <div className={`stats-grid ${isEditMode ? 'edit-mode' : ''}`}>
                {widgetOrder.map((widgetId) => {
                    const widgetConfig = {
                        companies: {
                            title: t('dashboard.totalCompanies'),
                            value: stats.total_companies || 0,
                            icon: '🏢',
                            color: 'green',
                            change: stats.total_companies > 0 ? Math.round((stats.total_companies / 5) * 100 - 100) : 0,
                            changeLabel: language === 'tr' ? 'bu ay' : 'this month',
                            trend: [3, 3, 4, 4, 5, stats.total_companies || 5]
                        },
                        emissions: {
                            title: t('dashboard.totalEmissions'),
                            value: formatNumber(stats.total_emissions || 0),
                            suffix: 'tCO2e',
                            icon: '🌿',
                            color: 'blue',
                            change: -7.3,
                            changeLabel: language === 'tr' ? 'geçen yıla göre' : 'vs last year',
                            trend: [320, 310, 305, 295, 290, Math.round((stats.total_emissions || 289000) / 1000)]
                        },
                        cbamCost: {
                            title: t('dashboard.estimatedCost'),
                            value: formatNumber(stats.estimated_cbam_cost || 0),
                            prefix: '€',
                            icon: '💰',
                            color: 'orange',
                            changeLabel: language === 'tr' ? '2026 yılı için' : 'for 2026',
                            trend: [0, 0, 5.8, 7.2, 8.5, (stats.estimated_cbam_cost || 0) / 1000000]
                        },
                        highRisk: {
                            title: t('dashboard.highRisk'),
                            value: stats.high_risk_count || 0,
                            suffix: language === 'tr' ? 'şirket' : 'companies',
                            icon: '⚠️',
                            color: 'danger',
                            changeLabel: language === 'tr' ? 'acil aksiyon gerektirir' : 'requires immediate action'
                        }
                    }

                    const config = widgetConfig[widgetId]
                    if (!config) return null

                    return (
                        <div
                            key={widgetId}
                            className={`widget-wrapper ${draggedWidget === widgetId ? 'dragging' : ''} ${isEditMode ? 'editable' : ''}`}
                            draggable={isEditMode}
                            onDragStart={(e) => handleDragStart(e, widgetId)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, widgetId)}
                            onDragEnd={handleDragEnd}
                        >
                            {isEditMode && <span className="drag-handle">⠿</span>}
                            <KPICard
                                {...config}
                                animate
                            />
                        </div>
                    )
                })}
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                {/* Emission Trend Chart */}
                <div className="card chart-card">
                    <div className="card-header">
                        <span>📈</span> {language === 'tr' ? 'Yıllık Emisyon Trendi' : 'Annual Emission Trend'}
                    </div>
                    <div className="card-body chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={emissionTrend.length > 0 ? emissionTrend : emissionTrendData}>
                                <defs>
                                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00874A" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00874A" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F39200" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F39200" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'white',
                                        border: '1px solid #eee',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                    formatter={(value) => [`${value.toLocaleString()} tCO2e`]}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="emissions"
                                    name="Gerçekleşen"
                                    stroke="#00874A"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorEmissions)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="target"
                                    name="Hedef"
                                    stroke="#F39200"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    fillOpacity={1}
                                    fill="url(#colorTarget)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sector Distribution */}
                <div className="card chart-card">
                    <div className="card-header">
                        <span>🏭</span> Sektörel Dağılım
                    </div>
                    <div className="card-body chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={sectorDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {sectorDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`${value.toLocaleString()} tCO2e`]}
                                    contentStyle={{
                                        background: 'white',
                                        border: '1px solid #eee',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* CBAM Cost Forecast */}
            <div className="card chart-card mb-4">
                <div className="card-header">
                    <span>💶</span> CBAM Maliyet Projeksiyonu (€M)
                </div>
                <div className="card-body chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={cbamProjection.length > 0 ? cbamProjection : cbamCostForecast}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid #eee',
                                    borderRadius: '8px'
                                }}
                                formatter={(value, name, props) => [
                                    `€${value}M (${props.payload.label})`,
                                    'CBAM Maliyeti'
                                ]}
                            />
                            <Bar
                                dataKey="cost"
                                fill="#004481"
                                radius={[4, 4, 0, 0]}
                            >
                                {cbamCostForecast.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.cost === 0 ? '#A0AEC0' : '#004481'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="chart-note">
                        <span className="note-badge gray">Raporlama Dönemi</span>
                        <span className="note-badge blue">Kademeli Uygulama</span>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="dashboard-grid">
                {/* Left Column */}
                <div>
                    {/* AI Quick Chat Card */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <span>🤖</span> AI Asistan - Hızlı Sorgulama
                        </div>
                        <div className="card-body">
                            <p className="text-muted" style={{ marginBottom: '1rem' }}>
                                CBAM maliyetleri, emisyon analizi veya yeşil kredi hakkında soru sorun.
                            </p>

                            <div className="suggested-actions">
                                <Link to="/chat" className="action-chip">CBAM maliyetimi hesapla</Link>
                                <Link to="/chat" className="action-chip">Emisyon analizi yap</Link>
                                <Link to="/chat" className="action-chip">Yeşil kredi önerisi</Link>
                                <Link to="/chat" className="action-chip">Risk değerlendirmesi</Link>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <Link to="/chat" className="btn btn-primary">
                                    <span>💬</span> AI Asistanı Aç
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Company Table */}
                    <div className="card">
                        <div className="card-header" style={{ justifyContent: 'space-between' }}>
                            <span>🏢 Şirket Durumu</span>
                            <Link to="/companies" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                                Tümünü Gör
                            </Link>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Şirket</th>
                                        <th>Sektör</th>
                                        <th>Emisyon</th>
                                        <th>CBAM Risk</th>
                                        <th>Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map((company) => (
                                        <tr key={company.id}>
                                            <td><strong>{company.name}</strong></td>
                                            <td>{company.sector}</td>
                                            <td>{company.emissions}</td>
                                            <td>
                                                <div className="progress" style={{ width: '100px' }}>
                                                    <div
                                                        className={`progress-bar ${company.risk > 80 ? 'danger' : company.risk > 50 ? 'orange' : 'green'}`}
                                                        style={{ width: `${company.risk}%` }}
                                                    />
                                                </div>
                                            </td>
                                            <td><span className={`badge ${company.badgeClass}`}>{company.riskLevel}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    {/* Metrics Card */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <span>📊</span> Özet Metrikler
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span className="text-muted">CBAM Hazırlık Seviyesi</span>
                                        <span className="font-semibold">62%</span>
                                    </div>
                                    <div className="progress-gradient">
                                        <div className="bar" style={{ width: '62%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span className="text-muted">Emisyon Azaltım Hedefi</span>
                                        <span className="font-semibold">45%</span>
                                    </div>
                                    <div className="progress-gradient">
                                        <div className="bar" style={{ width: '45%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span className="text-muted">Yeşil Yatırım Oranı</span>
                                        <span className="font-semibold">78%</span>
                                    </div>
                                    <div className="progress-gradient">
                                        <div className="bar" style={{ width: '78%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* News Feed */}
                    <div className="mb-4">
                        <NewsFeed />
                    </div>

                    {/* Activity Feed Widget */}
                    <div className="card mb-4">
                        <div className="card-header" style={{ justifyContent: 'space-between' }}>
                            <span>📋 Son Aktiviteler</span>
                            <Link to="/team" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                                Tümü
                            </Link>
                        </div>
                        <div className="card-body">
                            <ActivityFeed
                                activities={recentActivities}
                                maxItems={4}
                                showLoadMore={true}
                            />
                        </div>
                    </div>

                    {/* CBAM Timeline with Countdown */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <span>📅</span> CBAM Takvimi
                        </div>
                        <div className="card-body">
                            {/* CBAM Q1 2026 Deadline Countdown */}
                            <Countdown
                                targetDate="2026-01-31T23:59:59"
                                title="Q4 2025 Rapor Teslim Tarihi"
                            />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                                <div className="timeline-item">
                                    <div className="timeline-year green">2024</div>
                                    <div>
                                        <strong>Geçiş Dönemi Başlangıcı</strong>
                                        <p className="text-muted text-xs" style={{ margin: 0 }}>Raporlama zorunluluğu aktif</p>
                                    </div>
                                </div>

                                <div className="timeline-item">
                                    <div className="timeline-year orange">2026</div>
                                    <div>
                                        <strong>Kademeli Uygulama</strong>
                                        <p className="text-muted text-xs" style={{ margin: 0 }}>%22.5 sertifika zorunluluğu</p>
                                    </div>
                                </div>

                                <div className="timeline-item">
                                    <div className="timeline-year danger">2034</div>
                                    <div>
                                        <strong>Tam Uygulama</strong>
                                        <p className="text-muted text-xs" style={{ margin: 0 }}>%100 sertifika zorunluluğu</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Green Credit */}
                    <div className="card">
                        <div className="card-header">
                            <span>🏦</span> Yeşil Kredi Önerileri
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="metric-card">
                                    <strong>Yeşil Enerji Kredisi</strong>
                                    <p className="text-muted text-xs" style={{ margin: '0.25rem 0' }}>
                                        Güneş enerjisi yatırımı için
                                    </p>
                                    <div style={{ color: 'var(--bbva-green)', fontWeight: 600 }}>
                                        %1.49 faiz • 84 ay vade
                                    </div>
                                </div>

                                <div className="metric-card blue">
                                    <strong>Enerji Verimliliği Kredisi</strong>
                                    <p className="text-muted text-xs" style={{ margin: '0.25rem 0' }}>
                                        Üretim süreçleri için
                                    </p>
                                    <div style={{ color: 'var(--bbva-blue)', fontWeight: 600 }}>
                                        %1.79 faiz • 60 ay vade
                                    </div>
                                </div>
                            </div>

                            <Link to="/green-credit" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                                Tüm Kredileri Gör
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Dashboard
