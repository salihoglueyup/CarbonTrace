import { useState, useEffect } from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts'
import { useLanguage } from '../contexts/LanguageContext'
import { financeAPI } from '../services/api'
import { useToast } from '../contexts/ToastContext'
// import { useAuth } from '../contexts/AuthContext'

const Finance = () => {
    const { language } = useLanguage()
    // const { user } = useAuth()
    const { error: showError } = useToast()
    const [loading, setLoading] = useState(false)

    // State for calculation
    const [params, setParams] = useState({
        current_emissions: 5000,
        current_carbon_price: 80,
        target_year: 2030,
        annual_reduction_rate: 0.05, // 5% reduction per year
        carbon_price_increase_rate: 0.10 // 10% price increase per year
    })

    const [projectionData, setProjectionData] = useState([])

    useEffect(() => {
        // Initial Calculation
        handleCalculate()
    }, [])

    const handleCalculate = async () => {
        try {
            setLoading(true)
            const results = await financeAPI.calculateProjection(params)
            setProjectionData(results)
        } catch (error) {
            console.error('Calculation error:', error)
            showError('Hesaplama sırasında hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleParamChange = (e) => {
        const { name, value } = e.target
        setParams(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }))
    }

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'EUR' }).format(value)
    }

    return (
        <div className="finance-page">
            <div className="page-header">
                <div>
                    <h1>💰 {language === 'tr' ? 'Finansal Projeksiyon' : 'Financial Projection'}</h1>
                    <p className="text-muted">
                        {language === 'tr'
                            ? 'Karbon maliyetlerinizi analiz edin ve gelecek senaryolarını simüle edin.'
                            : 'Analyze carbon costs and simulate future scenarios.'}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={handleCalculate} disabled={loading}>
                    {loading ? '...' : '🔄'} {language === 'tr' ? 'Projeksiyonu Güncelle' : 'Update Projection'}
                </button>
            </div>

            <div className="dashboard-grid">
                {/* Scenario Controls */}
                <div className="card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-header">
                        <span>🎛️</span> {language === 'tr' ? 'Senaryo Parametreleri' : 'Scenario Parameters'}
                    </div>
                    <div className="card-body">
                        <div className="form-group mb-3">
                            <label>Mevcut Emisyon (tCO2e)</label>
                            <input
                                type="number"
                                name="current_emissions"
                                value={params.current_emissions}
                                onChange={handleParamChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label>Mevcut ETS Fiyatı (€/ton)</label>
                            <input
                                type="number"
                                name="current_carbon_price"
                                value={params.current_carbon_price}
                                onChange={handleParamChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label>Yıllık Azaltım Hedefi (%)</label>
                            <div className="range-slider">
                                <input
                                    type="range"
                                    name="annual_reduction_rate"
                                    min="0" max="0.30" step="0.01"
                                    value={params.annual_reduction_rate}
                                    onChange={handleParamChange}
                                />
                                <span>%{(params.annual_reduction_rate * 100).toFixed(0)}</span>
                            </div>
                        </div>

                        <div className="form-group mb-3">
                            <label>Yıllık Fiyat Artış Beklentisi (%)</label>
                            <div className="range-slider">
                                <input
                                    type="range"
                                    name="carbon_price_increase_rate"
                                    min="-0.10" max="0.50" step="0.01"
                                    value={params.carbon_price_increase_rate}
                                    onChange={handleParamChange}
                                />
                                <span>%{(params.carbon_price_increase_rate * 100).toFixed(0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projection Chart */}
                <div className="card" style={{ gridColumn: 'span 8' }}>
                    <div className="card-header">
                        <span>📈</span> {language === 'tr' ? 'Maliyet Projeksiyonu (2030)' : 'Cost Projection (2030)'}
                    </div>
                    <div className="card-body">
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name === 'total_cost' ? formatCurrency(value) : value,
                                        name === 'total_cost' ? 'Toplam Maliyet' : name
                                    ]}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="total_cost"
                                    stroke="#ff4d4f"
                                    fillOpacity={1}
                                    fill="url(#colorCost)"
                                    name="Tahmini Maliyet (€)"
                                />
                                <Line type="monotone" dataKey="projected_price" stroke="#82ca9d" name="Tahmini Fiyat (€)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="card" style={{ gridColumn: 'span 12' }}>
                    <div className="card-header">
                        <span>📊</span> {language === 'tr' ? 'Özet Metrikler' : 'Key Metrics'}
                    </div>
                    <div className="card-body">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon red">💸</div>
                                <div className="stat-content">
                                    <h4>2030 Toplam Maliyet</h4>
                                    <div className="value">
                                        {formatCurrency(projectionData[projectionData.length - 1]?.total_cost || 0)}
                                    </div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon green">📉</div>
                                <div className="stat-content">
                                    <h4>Emisyon Azaltımı</h4>
                                    <div className="value">
                                        {Math.round(params.current_emissions - (projectionData[projectionData.length - 1]?.projected_emissions || 0))} tCO2e
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Finance
