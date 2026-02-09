import { useState } from 'react'
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useLanguage } from '../contexts/LanguageContext'

const Hedging = () => {
    const { language } = useLanguage()
    const [hedgeAmount, setHedgeAmount] = useState(10000)
    const [hedgePeriod, setHedgePeriod] = useState(12)
    const [strategy, setStrategy] = useState('collar')

    // Carbon price history
    const priceHistory = language === 'tr' ? [
        { month: 'Oca 24', price: 68, forecast: null },
        { month: 'Şub 24', price: 72, forecast: null },
        { month: 'Mar 24', price: 76, forecast: null },
        { month: 'Nis 24', price: 74, forecast: null },
        { month: 'May 24', price: 78, forecast: null },
        { month: 'Haz 24', price: 82, forecast: null },
        { month: 'Tem 24', price: 85, forecast: null },
        { month: 'Ağu 24', price: 83, forecast: null },
        { month: 'Eyl 24', price: 88, forecast: null },
        { month: 'Eki 24', price: 92, forecast: null },
        { month: 'Kas 24', price: 90, forecast: null },
        { month: 'Ara 24', price: 95, forecast: 95 },
        { month: 'Oca 25', price: null, forecast: 98 },
        { month: 'Şub 25', price: null, forecast: 102 },
        { month: 'Mar 25', price: null, forecast: 105 },
        { month: 'Nis 25', price: null, forecast: 108 },
        { month: 'May 25', price: null, forecast: 112 },
        { month: 'Haz 25', price: null, forecast: 115 },
    ] : [
        { month: 'Jan 24', price: 68, forecast: null },
        { month: 'Feb 24', price: 72, forecast: null },
        { month: 'Mar 24', price: 76, forecast: null },
        { month: 'Apr 24', price: 74, forecast: null },
        { month: 'May 24', price: 78, forecast: null },
        { month: 'Jun 24', price: 82, forecast: null },
        { month: 'Jul 24', price: 85, forecast: null },
        { month: 'Aug 24', price: 83, forecast: null },
        { month: 'Sep 24', price: 88, forecast: null },
        { month: 'Oct 24', price: 92, forecast: null },
        { month: 'Nov 24', price: 90, forecast: null },
        { month: 'Dec 24', price: 95, forecast: 95 },
        { month: 'Jan 25', price: null, forecast: 98 },
        { month: 'Feb 25', price: null, forecast: 102 },
        { month: 'Mar 25', price: null, forecast: 105 },
        { month: 'Apr 25', price: null, forecast: 108 },
        { month: 'May 25', price: null, forecast: 112 },
        { month: 'Jun 25', price: null, forecast: 115 },
    ]

    const hedgingStrategies = language === 'tr' ? [
        { id: 'forward', name: 'Forward Kontrat', description: 'Gelecekteki fiyatı bugünden sabitleyin', risk: 'low', potentialSaving: '8-12%', icon: '📈' },
        { id: 'collar', name: 'Collar Stratejisi', description: 'Fiyat bandı ile sınırlı risk', risk: 'medium', potentialSaving: '12-18%', icon: '🎯' },
        { id: 'option', name: 'Opsiyon Alımı', description: 'Put opsiyonu ile aşağı yönlü koruma', risk: 'low', potentialSaving: '5-10%', icon: '🛡️' },
        { id: 'swap', name: 'Karbon Swap', description: 'Sabit-değişken fiyat takası', risk: 'medium', potentialSaving: '10-15%', icon: '🔄' }
    ] : [
        { id: 'forward', name: 'Forward Contract', description: 'Lock in future price today', risk: 'low', potentialSaving: '8-12%', icon: '📈' },
        { id: 'collar', name: 'Collar Strategy', description: 'Limited risk with price band', risk: 'medium', potentialSaving: '12-18%', icon: '🎯' },
        { id: 'option', name: 'Option Purchase', description: 'Downside protection with put option', risk: 'low', potentialSaving: '5-10%', icon: '🛡️' },
        { id: 'swap', name: 'Carbon Swap', description: 'Fixed-floating price exchange', risk: 'medium', potentialSaving: '10-15%', icon: '🔄' }
    ]

    const calculateHedgeCost = () => {
        const currentPrice = 95 // EUR/tCO2
        const baseHedgeCost = hedgeAmount * currentPrice

        let strategyMultiplier = 1
        switch (strategy) {
            case 'forward': strategyMultiplier = 0.98; break
            case 'collar': strategyMultiplier = 1.02; break
            case 'option': strategyMultiplier = 1.05; break
            case 'swap': strategyMultiplier = 1.00; break
            default: strategyMultiplier = 1
        }

        const hedgeCost = baseHedgeCost * strategyMultiplier
        const unhedgedRisk = baseHedgeCost * 1.15 // Assume 15% price increase risk
        const potentialSaving = unhedgedRisk - hedgeCost

        return {
            hedgeCost: hedgeCost.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', { maximumFractionDigits: 0 }),
            unhedgedRisk: unhedgedRisk.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', { maximumFractionDigits: 0 }),
            potentialSaving: potentialSaving.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', { maximumFractionDigits: 0 }),
            effectivePrice: (hedgeCost / hedgeAmount).toFixed(2)
        }
    }

    const hedgeResult = calculateHedgeCost()

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <a href="/">Dashboard</a>
                <span className="separator">/</span>
                <span className="current">{language === 'tr' ? 'Karbon Hedging' : 'Carbon Hedging'}</span>
            </div>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>📈 {language === 'tr' ? 'Karbon Fiyat Hedging' : 'Carbon Price Hedging'}</h1>
                    <p className="text-muted">
                        {language === 'tr'
                            ? 'CBAM maliyetlerinizi hedge stratejileri ile yönetin'
                            : 'Manage your CBAM costs with hedging strategies'}
                    </p>
                </div>
            </div>

            {/* Price Chart */}
            <div className="card chart-card mb-4">
                <div className="card-header">
                    <span>📊</span> EU ETS Karbon Fiyatı (EUR/tCO2)
                </div>
                <div className="card-body chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={priceHistory}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00874A" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00874A" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F39200" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#F39200" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis domain={[60, 120]} tick={{ fontSize: 11 }} />
                            <Tooltip
                                formatter={(value) => [`€${value}/tCO2`]}
                                contentStyle={{ borderRadius: '8px' }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="price"
                                name="Gerçekleşen"
                                stroke="#00874A"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                                connectNulls
                            />
                            <Area
                                type="monotone"
                                dataKey="forecast"
                                name="Tahmin"
                                stroke="#F39200"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fillOpacity={1}
                                fill="url(#colorForecast)"
                                connectNulls
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="chart-note">
                        <span className="note-badge green">📈 Son Fiyat: €95/tCO2</span>
                        <span className="note-badge orange">📊 6-Ay Tahmin: €115/tCO2 (+21%)</span>
                    </div>
                </div>
            </div>

            {/* Hedging Calculator */}
            <div className="hedging-layout">
                <div className="hedging-calculator card">
                    <div className="card-header">
                        <span>🧮</span> Hedging Hesaplayıcı
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label>Hedge Edilecek Miktar (tCO2)</label>
                            <input
                                type="number"
                                value={hedgeAmount}
                                onChange={(e) => setHedgeAmount(Number(e.target.value))}
                                min="1000"
                                step="1000"
                            />
                        </div>

                        <div className="form-group">
                            <label>Hedge Süresi (Ay)</label>
                            <select value={hedgePeriod} onChange={(e) => setHedgePeriod(Number(e.target.value))}>
                                <option value={6}>6 Ay</option>
                                <option value={12}>12 Ay</option>
                                <option value={18}>18 Ay</option>
                                <option value={24}>24 Ay</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Strateji</label>
                            <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                                {hedgingStrategies.map(s => (
                                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="hedge-result">
                            <div className="result-row">
                                <span>Hedge Maliyeti</span>
                                <strong>€{hedgeResult.hedgeCost}</strong>
                            </div>
                            <div className="result-row">
                                <span>Efektif Fiyat</span>
                                <strong>€{hedgeResult.effectivePrice}/tCO2</strong>
                            </div>
                            <div className="result-row warning">
                                <span>Hedge'siz Risk</span>
                                <strong>€{hedgeResult.unhedgedRisk}</strong>
                            </div>
                            <div className="result-row success">
                                <span>Potansiyel Tasarruf</span>
                                <strong className="text-green">€{hedgeResult.potentialSaving}</strong>
                            </div>
                        </div>

                        <button className="btn btn-primary btn-block mt-4">
                            💼 Hedge Teklifi Al
                        </button>
                    </div>
                </div>

                {/* Strategies */}
                <div className="hedging-strategies">
                    <h3>🎯 Hedging Stratejileri</h3>
                    <div className="strategies-grid">
                        {hedgingStrategies.map(s => (
                            <div
                                key={s.id}
                                className={`strategy-card ${strategy === s.id ? 'active' : ''}`}
                                onClick={() => setStrategy(s.id)}
                            >
                                <div className="strategy-icon">{s.icon}</div>
                                <div className="strategy-info">
                                    <h4>{s.name}</h4>
                                    <p>{s.description}</p>
                                    <div className="strategy-meta">
                                        <span className={`risk-badge ${s.risk}`}>
                                            {s.risk === 'low' ? '🟢 Düşük Risk' : '🟡 Orta Risk'}
                                        </span>
                                        <span className="saving-badge">
                                            💰 {s.potentialSaving}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="info-cards-row mt-4">
                <div className="card info-card">
                    <div className="card-body">
                        <h4>📅 2026 CBAM Deadline</h4>
                        <p>Kademeli uygulama başlıyor. Şimdi hedge stratejinizi belirleyin.</p>
                    </div>
                </div>
                <div className="card info-card">
                    <div className="card-body">
                        <h4>📈 Fiyat Trendi</h4>
                        <p>AB ETS fiyatları 2030'a kadar €100-150 aralığına yükselebilir.</p>
                    </div>
                </div>
                <div className="card info-card">
                    <div className="card-body">
                        <h4>🏦 Garanti BBVA</h4>
                        <p>Karbon hedging ürünleri için uzman danışmanlık alın.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hedging
