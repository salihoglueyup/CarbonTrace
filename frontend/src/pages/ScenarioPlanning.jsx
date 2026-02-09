import { useState, useEffect } from 'react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from 'recharts'
import { useLanguage } from '../contexts/LanguageContext'

const ScenarioPlanning = () => {
    const { language } = useLanguage()

    // State for parameters
    const [scenarios, setScenarios] = useState([])
    const [currentScenario, setCurrentScenario] = useState({
        id: null,
        name: '',
        baseEmissions: 50000,
        growthRate: 3,
        reductionTarget: 30,
        carbonPrice: 90,
        priceVolatility: 20,
        years: 10
    })

    // Load scenarios from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('cbam_scenarios')
        if (saved) {
            setScenarios(JSON.parse(saved))
        }
    }, [])

    // Save scenarios to localStorage when changed
    useEffect(() => {
        localStorage.setItem('cbam_scenarios', JSON.stringify(scenarios))
    }, [scenarios])

    const t = {
        title: language === 'tr' ? 'Etkileşimli Senaryo Planlama' : 'Interactive Scenario Planning',
        subtitle: language === 'tr' ? 'Farklı stratejilerin finansal etkilerini simüle edin ve karşılaştırın.' : 'Simulate and compare the financial impacts of different strategies.',
        params: language === 'tr' ? 'Parametreler' : 'Parameters',
        savedScenarios: language === 'tr' ? 'Kayıtlı Senaryolar' : 'Saved Scenarios',
        saveBtn: language === 'tr' ? 'Senaryoyu Kaydet' : 'Save Scenario',
        loadBtn: language === 'tr' ? 'Yükle' : 'Load',
        deleteBtn: language === 'tr' ? 'Sil' : 'Delete',
        newBtn: language === 'tr' ? 'Yeni' : 'New',
        baseEmission: language === 'tr' ? 'Mevcut Emisyon (tCO2e)' : 'Base Emissions (tCO2e)',
        growth: language === 'tr' ? 'Yıllık Büyüme (%)' : 'Annual Growth (%)',
        reduction: language === 'tr' ? 'Azaltım Hedefi (%)' : 'Reduction Target (%)',
        carbonPrice: language === 'tr' ? 'Başlangıç Karbon Fiyatı (€/t)' : 'Initial Carbon Price (€/t)',
        volatility: language === 'tr' ? 'Fiyat Volatilitesi (+/- %)' : 'Price Volatility (+/- %)',
        years: language === 'tr' ? 'Projeksiyon Süresi (Yıl)' : 'Projection Period (Years)',
        summary: language === 'tr' ? 'Özet Analiz' : 'Summary Analysis',
        bauCost: language === 'tr' ? 'BAU Maliyet' : 'BAU Cost',
        reducedCost: language === 'tr' ? 'Azaltım Sonrası' : 'After Reduction',
        savings: language === 'tr' ? 'Toplam Tasarruf' : 'Total Savings',
        emissionChart: language === 'tr' ? 'Emisyon Projeksiyonu' : 'Emission Projection',
        costChart: language === 'tr' ? 'Maliyet Analizi (Kümülatif)' : 'Cost Analysis (Cumulative)',
        enterName: language === 'tr' ? 'Senaryo Adı Giriniz' : 'Enter Scenario Name',
        scenarioName: language === 'tr' ? 'Senaryo Adı' : 'Scenario Name',
    }

    const handleChange = (field, value) => {
        setCurrentScenario(prev => ({ ...prev, [field]: Number(value) }))
    }

    const handleSave = () => {
        if (!currentScenario.name) return

        const newScenario = { ...currentScenario, id: Date.now() }

        if (currentScenario.id) {
            // Update existing
            setScenarios(prev => prev.map(s => s.id === currentScenario.id ? currentScenario : s))
        } else {
            // Add new
            setScenarios(prev => [...prev, newScenario])
        }

        // Reset ID to continue editing as "saved"
        setCurrentScenario(prev => ({ ...prev, id: newScenario.id }))
    }

    const handleLoad = (scenario) => {
        setCurrentScenario(scenario)
    }

    const handleDelete = (id) => {
        setScenarios(prev => prev.filter(s => s.id !== id))
        if (currentScenario.id === id) {
            setCurrentScenario({ ...currentScenario, id: null, name: '' })
        }
    }

    const handleNew = () => {
        setCurrentScenario({
            id: null,
            name: '',
            baseEmissions: 50000,
            growthRate: 3,
            reductionTarget: 30,
            carbonPrice: 90,
            priceVolatility: 20,
            years: 10
        })
    }

    // Calculations
    const generateData = () => {
        const data = []
        const { baseEmissions, growthRate, reductionTarget, carbonPrice, priceVolatility, years } = currentScenario
        let currentEmissions = baseEmissions
        let cumulativeBauCost = 0
        let cumulativeReducedCost = 0

        for (let i = 0; i <= years; i++) {
            const year = 2024 + i

            // BAU Emissions
            const bauEmissions = baseEmissions * Math.pow(1 + growthRate / 100, i)

            // Reduced Emissions
            // Linear reduction towards target over the years
            const reductionFactor = Math.min(reductionTarget / 100, (reductionTarget / 100) * (i / years))
            const reducedEmissions = bauEmissions * (1 - reductionFactor)

            // Carbon Price Speculation
            const priceGrowth = 1 + (5 / 100) // Assumed 5% annual increase base
            const basePrice = carbonPrice * Math.pow(priceGrowth, i)
            const lowPrice = basePrice * (1 - priceVolatility / 100)
            const highPrice = basePrice * (1 + priceVolatility / 100)

            // CBAM Phase-in Factor
            let cbamRate = 0
            if (year >= 2030) cbamRate = 1
            else if (year >= 2029) cbamRate = 0.9
            else if (year >= 2028) cbamRate = 0.675
            else if (year >= 2027) cbamRate = 0.45
            else if (year >= 2026) cbamRate = 0.225

            const annualBauCost = bauEmissions * basePrice * cbamRate
            const annualReducedCost = reducedEmissions * basePrice * cbamRate

            cumulativeBauCost += annualBauCost
            cumulativeReducedCost += annualReducedCost

            data.push({
                year,
                bauEmissions: Math.round(bauEmissions),
                reducedEmissions: Math.round(reducedEmissions),
                bauCost: Math.round(annualBauCost),
                reducedCost: Math.round(annualReducedCost),
                cumulativeBau: Math.round(cumulativeBauCost),
                cumulativeReduced: Math.round(cumulativeReducedCost),
                carbonPrice: Math.round(basePrice)
            })
        }
        return data
    }

    const chartData = generateData()
    const lastPoint = chartData[chartData.length - 1]
    const totalSavings = lastPoint.cumulativeBau - lastPoint.cumulativeReduced

    return (
        <div className="scenario-page">
            <div className="page-header">
                <div>
                    <h1>🎮 {t.title}</h1>
                    <p className="text-muted">{t.subtitle}</p>
                </div>
                <button className="btn btn-primary" onClick={handleNew}>
                    ➕ {t.newBtn}
                </button>
            </div>

            <div className="scenario-grid-layout">
                {/* Left Column: Controls */}
                <div className="scenario-controls">
                    <div className="card">
                        <div className="card-header">
                            <span>⚙️ {t.params}</span>
                        </div>
                        <div className="card-body">
                            {/* Scrollable Container for Inputs */}
                            <div className="controls-scroll">
                                <div className="control-group">
                                    <label>{t.scenarioName}</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder={t.enterName}
                                            value={currentScenario.name}
                                            onChange={e => setCurrentScenario(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                        <button className="btn btn-sm btn-secondary" onClick={handleSave} disabled={!currentScenario.name}>
                                            💾
                                        </button>
                                    </div>
                                </div>

                                <hr className="divider" />

                                <div className="slider-group">
                                    <div className="slider-label">
                                        <label>{t.baseEmission}</label>
                                        <span className="value-badge">{currentScenario.baseEmissions.toLocaleString()}</span>
                                    </div>
                                    <input
                                        type="range" min="1000" max="500000" step="1000"
                                        value={currentScenario.baseEmissions}
                                        onChange={e => handleChange('baseEmissions', e.target.value)}
                                    />
                                </div>

                                <div className="slider-group">
                                    <div className="slider-label">
                                        <label>{t.growth}</label>
                                        <span className="value-badge">{currentScenario.growthRate}%</span>
                                    </div>
                                    <input
                                        type="range" min="-5" max="20" step="0.5"
                                        value={currentScenario.growthRate}
                                        onChange={e => handleChange('growthRate', e.target.value)}
                                    />
                                </div>

                                <div className="slider-group">
                                    <div className="slider-label">
                                        <label>{t.reduction}</label>
                                        <span className="value-badge highlight">{currentScenario.reductionTarget}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100" step="1"
                                        value={currentScenario.reductionTarget}
                                        onChange={e => handleChange('reductionTarget', e.target.value)}
                                        className="slider-success"
                                    />
                                </div>

                                <div className="slider-group">
                                    <div className="slider-label">
                                        <label>{t.carbonPrice}</label>
                                        <span className="value-badge">{currentScenario.carbonPrice} €</span>
                                    </div>
                                    <input
                                        type="range" min="50" max="300" step="5"
                                        value={currentScenario.carbonPrice}
                                        onChange={e => handleChange('carbonPrice', e.target.value)}
                                    />
                                </div>

                                <div className="slider-group">
                                    <div className="slider-label">
                                        <label>{t.years}</label>
                                        <span className="value-badge">{currentScenario.years}</span>
                                    </div>
                                    <input
                                        type="range" min="5" max="30" step="1"
                                        value={currentScenario.years}
                                        onChange={e => handleChange('years', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Saved Scenarios List */}
                    {scenarios.length > 0 && (
                        <div className="card mt-4">
                            <div className="card-header">
                                <span>📂 {t.savedScenarios}</span>
                            </div>
                            <div className="card-body p-0">
                                <div className="saved-list">
                                    {scenarios.map(s => (
                                        <div key={s.id} className={`saved-item ${currentScenario.id === s.id ? 'active' : ''}`} onClick={() => handleLoad(s)}>
                                            <div className="saved-info">
                                                <span className="saved-name">{s.name}</span>
                                                <span className="saved-meta">Targets: {s.reductionTarget}% | {s.years} years</span>
                                            </div>
                                            <button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}>
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Visuals */}
                <div className="scenario-visuals">
                    {/* KPI Cards */}
                    <div className="kpi-grid-3">
                        <div className="kpi-card danger">
                            <div className="kpi-icon">📈</div>
                            <div className="kpi-content">
                                <span className="label">{t.bauCost}</span>
                                <span className="value">€{(lastPoint.cumulativeBau / 1000000).toFixed(1)}M</span>
                            </div>
                        </div>
                        <div className="kpi-card warning">
                            <div className="kpi-icon">📉</div>
                            <div className="kpi-content">
                                <span className="label">{t.reducedCost}</span>
                                <span className="value">€{(lastPoint.cumulativeReduced / 1000000).toFixed(1)}M</span>
                            </div>
                        </div>
                        <div className="kpi-card success">
                            <div className="kpi-icon">💰</div>
                            <div className="kpi-content">
                                <span className="label">{t.savings}</span>
                                <span className="value">€{(totalSavings / 1000000).toFixed(1)}M</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="card">
                        <div className="card-header">
                            <span>🌿 {t.emissionChart}</span>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorBau" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#E53E3E" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#E53E3E" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorReduced" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00874A" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00874A" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                                    <XAxis dataKey="year" />
                                    <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={v => v.toLocaleString() + ' tCO2e'} />
                                    <Legend />
                                    <Area type="monotone" dataKey="bauEmissions" name="BAU" stroke="#E53E3E" fill="url(#colorBau)" />
                                    <Area type="monotone" dataKey="reducedEmissions" name="Target" stroke="#00874A" fill="url(#colorReduced)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card mt-4">
                        <div className="card-header">
                            <span>💳 {t.costChart}</span>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                                    <XAxis dataKey="year" />
                                    <YAxis tickFormatter={v => `€${(v / 1000000).toFixed(0)}M`} />
                                    <Tooltip formatter={v => `€${v.toLocaleString()}`} />
                                    <Legend />
                                    <Bar dataKey="annualBauCost" name={t.bauCost} fill="#E53E3E" opacity={0.6} />
                                    <Bar dataKey="annualReducedCost" name={t.reducedCost} fill="#00874A" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .scenario-grid-layout {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 1.5rem;
                    align-items: start;
                }
                
                .control-group { margin-bottom: 1.5rem; }
                .input-group { display: flex; gap: 0.5rem; }
                .form-control { flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 6px; }
                
                .slider-group { margin-bottom: 1.5rem; }
                .slider-label { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; color: #555; }
                .value-badge { background: #eee; padding: 2px 8px; border-radius: 12px; font-weight: 600; font-size: 0.8rem; }
                .value-badge.highlight { background: #e3f9e5; color: #00874A; }
                
                input[type=range] { width: 100%; cursor: pointer; }
                
                .saved-list { max-height: 300px; overflow-y: auto; }
                .saved-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s; }
                .saved-item:hover { background: #f9f9f9; }
                .saved-item.active { background: #e3f9e5; border-left: 3px solid #00874A; }
                .saved-name { display: block; font-weight: 600; font-size: 0.9rem; }
                .saved-meta { display: block; font-size: 0.75rem; color: #888; }
                .btn-icon.delete { background: none; border: none; cursor: pointer; opacity: 0.5; transition: opacity 0.2s; }
                .btn-icon.delete:hover { opacity: 1; }

                .kpi-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
                .kpi-card { background: white; padding: 1.25rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 1rem; }
                .kpi-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
                .kpi-content { display: flex; flex-direction: column; }
                .kpi-content .label { font-size: 0.8rem; color: #666; }
                .kpi-content .value { font-size: 1.4rem; font-weight: 700; color: #333; }
                
                .kpi-card.danger .kpi-icon { background: rgba(229, 62, 62, 0.1); color: #E53E3E; }
                .kpi-card.warning .kpi-icon { background: rgba(243, 146, 0, 0.1); color: #F39200; }
                .kpi-card.success .kpi-icon { background: rgba(0, 135, 74, 0.1); color: #00874A; }

                @media (max-width: 1024px) {
                    .scenario-grid-layout { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    )
}

export default ScenarioPlanning
