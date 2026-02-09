import { useState, useEffect, useCallback } from 'react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Treemap, ComposedChart, Bar, Line, Legend, Cell
} from 'recharts'
import { dashboardAPI } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import './DataVisualization.css' // Import independent CSS

// --- THEME CONFIGURATION ---
const BBVA = {
    green: '#00874A',
    greenDark: '#006837',
    blue: '#004481',
    orange: '#F39200',
    red: '#E53E3E',
    gray: '#4A5568',
}

// --- COMPONENTS ---

const PageHeader = ({ lastUpdated, onRefresh }) => (
    <div className="viz-header">
        <div className="viz-title">
            <div className="viz-badge">Pro Analytics</div>
            <h1>Veri Görselleştirme</h1>
            <p>Finansal projeksiyonlar, emisyon trendleri ve risk analizleri.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Son Güncelleme: {lastUpdated ? new Date().toLocaleTimeString() : '-'}
            </span>
            <button
                onClick={onRefresh}
                className="viz-tab-btn active"
                title="Verileri Yenile"
            >
                ⟳ Yenile
            </button>
        </div>
    </div>
)

const KPICard = ({ title, value, unit, colorClass, icon }) => (
    <div className="viz-kpi-card">
        <div className={`viz-kpi-icon-bg ${colorClass}`}>
            {icon}
        </div>
        <p className="viz-kpi-title">{title}</p>
        <div className="viz-kpi-value">
            <h2>{value}</h2>
            <span className="viz-kpi-unit">{unit}</span>
        </div>
    </div>
)

const TabMenu = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'trend', label: 'Emisyon Trendi', icon: '📈' },
        { id: 'projection', label: 'Projeksiyon', icon: '🔮' },
        { id: 'sectors', label: 'Sektör Dağılımı', icon: '🏭' },
        { id: 'risk', label: 'Risk Matrisi', icon: '⚠️' }
    ]

    return (
        <div className="viz-tabs">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`viz-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                >
                    <span>{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>
    )
}

const ChartContainer = ({ title, description, children }) => (
    <div className="viz-chart-card">
        <div className="viz-chart-header">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{description}</p>
        </div>
        <div className="viz-chart-body">
            {children}
        </div>
    </div>
)

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'rgba(255,255,255,0.95)', padding: '0.75rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
                <p style={{ fontWeight: 700, marginBottom: '0.25rem', color: '#1e293b' }}>{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
                        <span style={{ color: '#475569' }}>{entry.name}:</span>
                        <span style={{ fontWeight: 600, color: '#334155' }}>
                            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

const InsightPanel = ({ activeViz, data }) => {
    return (
        <div className="viz-insight-card">
            {/* Background Decor */}
            <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'white', opacity: 0.05, borderRadius: '50%', filter: 'blur(40px)' }} />

            <div className="viz-insight-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', backdropFilter: 'blur(4px)' }}>
                        ✨
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>AI Asistanı</h3>
                        <p style={{ fontSize: '0.75rem', color: '#bfdbfe' }}>Anlık Veri Analizi</p>
                    </div>
                </div>

                <div className="viz-glass-box">
                    {activeViz === 'trend' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#eff6ff' }}>
                                Scope 1 emisyonlarında geçen seneye göre <strong style={{ color: '#4ade80' }}>
                                    {data?.trend?.length > 1
                                        ? `%${((data.trend[data.trend.length - 1].scope1 - data.trend[data.trend.length - 2].scope1) / data.trend[data.trend.length - 2].scope1 * 100).toFixed(1)} artış`
                                        : '%4.2 artış'}
                                </strong> var. Bu trend devam ederse 2026 hedefleri riske girebilir.
                            </p>
                            <div className="viz-divider" />
                            <p style={{ fontSize: '0.75rem', color: '#bfdbfe' }}>
                                Öneri: Üretim hattı A'daki enerji verimliliği projesini hızlandırın.
                            </p>
                        </div>
                    )}
                    {activeViz === 'projection' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#eff6ff' }}>
                                2030 yılı için tahmini CBAM maliyetiniz <strong style={{ color: '#fb923c' }}>
                                    {data?.projections?.length > 0
                                        ? `€${(data.projections[data.projections.length - 1].cost / 1000000).toFixed(1)}M`
                                        : '€1.2M'}
                                </strong> seviyesine ulaşacak.
                            </p>
                        </div>
                    )}
                    {activeViz === 'sectors' && (
                        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#eff6ff' }}>
                            <strong style={{ color: 'white' }}>
                                {data?.sectors?.length > 0 ? data.sectors[0].sector : 'Çimento ve Demir-Çelik'}
                            </strong> sektörü toplam emisyonun %72'sini oluşturuyor.
                        </p>
                    )}
                    {activeViz === 'risk' && (
                        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#eff6ff' }}>
                            Tedarik zincirinizde <strong style={{ color: '#f87171' }}>
                                {data?.companies?.filter(c => c.risk_level === 'Kritik').length || '3'} kritik riskli
                            </strong> şirket tespit edildi.
                        </p>
                    )}
                </div>

                <div className="viz-glass-box">
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#bfdbfe', marginBottom: '0.75rem' }}>Hızlı İstatistikler</h4>
                    <div className="viz-flex-between" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#dbeafe' }}>Veri Güvenilirliği</span>
                        <span style={{ fontWeight: 700, color: '#4ade80' }}>%94</span>
                    </div>
                    <div className="viz-flex-between" style={{ fontSize: '0.875rem' }}>
                        <span style={{ color: '#dbeafe' }}>Son Rapor</span>
                        <span style={{ fontWeight: 600 }}>2 Gün Önce</span>
                    </div>
                </div>

                <button className="viz-insight-btn">
                    Detaylı Raporu İndir →
                </button>
            </div>
        </div>
    )
}

// --- MAIN PAGE ---

const DataVisualization = () => {
    const [activeViz, setActiveViz] = useState('trend')
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({ trend: [], sectors: [], projections: [], companies: [], stats: null })
    const { error: showError } = useToast()

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const [trendRes, sectorRes, projRes, companiesRes, statsRes] = await Promise.all([
                dashboardAPI.getEmissionTrend(),
                dashboardAPI.getSectorBreakdown(),
                dashboardAPI.getCbamProjection(),
                dashboardAPI.getCompanySummary(),
                dashboardAPI.getStats()
            ])
            setData({
                trend: trendRes,
                sectors: sectorRes,
                projections: projRes,
                companies: companiesRes,
                stats: statsRes
            })
        } catch (err) {
            console.error(err)
            showError('Veri yüklenemedi.')
        } finally {
            setLoading(false)
        }
    }, [showError])

    useEffect(() => { fetchData() }, [fetchData])

    if (loading) {
        return (
            <div className="viz-loading">
                <div className="viz-spinner" />
                <p style={{ color: '#64748b' }}>Analizler hazırlanıyor...</p>
            </div>
        )
    }

    return (
        <div className="viz-page-container">
            <div className="viz-max-width">

                <PageHeader lastUpdated={data.stats?.last_updated} onRefresh={fetchData} />

                {/* KPI Grid */}
                <div className="viz-kpi-grid">
                    <KPICard
                        title="Toplam Emisyon"
                        value={data.stats?.total_emissions?.toLocaleString()}
                        unit="tCO2e"
                        icon="🏭"
                        colorClass="text-bbva-blue"
                    />
                    <KPICard
                        title="CBAM Maliyeti"
                        value={`€${data.stats?.estimated_cbam_cost?.toLocaleString()}`}
                        unit="Tahmini"
                        icon="💶"
                        colorClass="text-bbva-orange"
                    />
                    <KPICard
                        title="Aktif Tedarikçi"
                        value="142"
                        unit="Firma"
                        icon="🚚"
                        colorClass="text-bbva-green"
                    />
                    <KPICard
                        title="Ortalama Risk"
                        value="Düşük"
                        unit="Seviye"
                        icon="🛡️"
                        colorClass="text-bbva-purple"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="viz-content-grid">

                    {/* Left Column: Charts */}
                    <div className="viz-charts-col">
                        <TabMenu activeTab={activeViz} onTabChange={setActiveViz} />

                        {activeViz === 'trend' && (
                            <ChartContainer
                                title="Yıllık Emisyon Değişimi"
                                description="Scope 1, 2 ve 3 bazında yıllık karşılaştırmalı karbon ayak izi trendi."
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gS1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={BBVA.green} stopOpacity={0.8} /><stop offset="95%" stopColor={BBVA.green} stopOpacity={0} /></linearGradient>
                                            <linearGradient id="gS2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={BBVA.blue} stopOpacity={0.8} /><stop offset="95%" stopColor={BBVA.blue} stopOpacity={0} /></linearGradient>
                                            <linearGradient id="gS3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={BBVA.orange} stopOpacity={0.8} /><stop offset="95%" stopColor={BBVA.orange} stopOpacity={0} /></linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="year" tick={{ fill: BBVA.gray, fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tick={{ fill: BBVA.gray, fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend verticalAlign="top" height={36} iconType="circle" />
                                        <Area type="monotone" dataKey="scope1" name="Scope 1" stackId="1" stroke={BBVA.green} fill="url(#gS1)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="scope2" name="Scope 2" stackId="1" stroke={BBVA.blue} fill="url(#gS2)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="scope3" name="Scope 3" stackId="1" stroke={BBVA.orange} fill="url(#gS3)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}

                        {activeViz === 'projection' && (
                            <ChartContainer
                                title="Maliyet Projeksiyonu (2024-2030)"
                                description="Artan karbon vergisi oranlarına göre kümülatif maliyet tahmini."
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={data.projections} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="year" tick={{ fill: BBVA.gray }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis yAxisId="left" stroke={BBVA.red} orientation="left" axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="right" stroke={BBVA.blue} orientation="right" axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend verticalAlign="top" height={36} />
                                        <Bar yAxisId="left" dataKey="cost" name="Maliyet (€)" fill={BBVA.red} radius={[4, 4, 0, 0]} barSize={40} fillOpacity={0.9} />
                                        <Line yAxisId="right" type="monotone" dataKey="rate" name="Vergi Oranı" stroke={BBVA.blue} strokeWidth={3} dot={{ r: 4, fill: 'white', strokeWidth: 2 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}

                        {activeViz === 'sectors' && (
                            <ChartContainer title="Sektörel Dağılım" description="Emisyon kaynaklarının sektörlere göre ağırlığı.">
                                <ResponsiveContainer width="100%" height="100%">
                                    <Treemap
                                        data={data.sectors}
                                        dataKey="emissions"
                                        nameKey="sector"
                                        aspectRatio={4 / 3}
                                        stroke="#fff"
                                        isAnimationActive={false}
                                    >
                                        <Tooltip content={<CustomTooltip />} />
                                    </Treemap>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}

                        {activeViz === 'risk' && (
                            <ChartContainer title="Risk Matrisi" description="Şirketlerin risk skorlarına göre sıralaması.">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart layout="vertical" data={data.companies.slice(0, 8)} margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                                        <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={150} tick={{ fill: BBVA.gray, fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="risk_progress" name="Risk Skoru" barSize={20} radius={[0, 4, 4, 0]} background={{ fill: '#f8fafc' }}>
                                            {data.companies.slice(0, 8).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={
                                                    entry.risk_level === 'Kritik' ? BBVA.red :
                                                        entry.risk_level === 'Yüksek' ? BBVA.orange :
                                                            entry.risk_level === 'Orta' ? '#ECC94B' : BBVA.green
                                                } />
                                            ))}
                                        </Bar>
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}
                    </div>

                    {/* Right Column: AI Panel */}
                    <div className="viz-insight-col">
                        <InsightPanel activeViz={activeViz} data={data} />
                    </div>

                </div>
            </div>
        </div>
    )
}

export default DataVisualization
