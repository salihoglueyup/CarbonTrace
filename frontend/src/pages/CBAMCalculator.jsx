import { useState, useEffect } from 'react'
import Stepper from '../components/Stepper'
import { ProgressBar } from '../components/MiniCharts'
import { useLanguage } from '../contexts/LanguageContext'
import { cbamAPI } from '../services/api'

const CBAMCalculator = () => {
    const { language } = useLanguage()

    const [formData, setFormData] = useState({
        emissions: 20000,
        eu_export: 5000000,
        scenario: 'Moderate'
    })
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [carbonRates, setCarbonRates] = useState(null)

    // Initial rates fetch
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const rates = await cbamAPI.getRates()
                setCarbonRates(rates)
            } catch (err) {
                console.error('Error fetching rates:', err)
            }
        }
        fetchRates()
    }, [])

    const steps = language === 'tr' ? [
        { id: 'emission', title: 'Emisyon Giriş', description: 'Toplam emisyon miktarı' },
        { id: 'export', title: 'İhracat Değeri', description: 'AB ihracat tutarı' },
        { id: 'scenario', title: 'Senaryo Seçimi', description: 'Fiyat senaryosu' },
        { id: 'result', title: 'Sonuç', description: 'Maliyet hesaplama' }
    ] : [
        { id: 'emission', title: 'Emission Input', description: 'Total emission amount' },
        { id: 'export', title: 'Export Value', description: 'EU export revenue' },
        { id: 'scenario', title: 'Scenario Selection', description: 'Price scenario' },
        { id: 'result', title: 'Result', description: 'Cost calculation' }
    ]

    const scenarios = language === 'tr' ? [
        { id: 'Conservative', name: 'İyimser', price: 80, description: 'Düşük karbon fiyatı senaryosu' },
        { id: 'Moderate', name: 'Orta (Baz)', price: carbonRates?.current_price || 90, description: 'Mevcut piyasa fiyatı' },
        { id: 'Aggressive', name: 'Kötümser', price: 100, description: 'AB politikaları sıkılaşır' }
    ] : [
        { id: 'Conservative', name: 'Optimistic', price: 80, description: 'Low carbon price scenario' },
        { id: 'Moderate', name: 'Moderate (Base)', price: carbonRates?.current_price || 90, description: 'Current market price' },
        { id: 'Aggressive', name: 'Pessimistic', price: 100, description: 'EU policies tighten' }
    ]

    const handleChange = (e) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }))
    }

    const calculateCost = async () => {
        setLoading(true)

        try {
            // Selected scenario price
            const carbonPrice = scenarios.find(s => s.id === formData.scenario)?.price || 90

            // Call API for calculation
            const apiResult = await cbamAPI.calculateSimple(
                formData.emissions,
                carbonPrice
            )

            // Calculate other metrics
            const grossCost = apiResult.estimated_cost
            const costToRevenue = formData.eu_export > 0 ? (grossCost / formData.eu_export) * 100 : 0

            // Calculate for all scenarios locally for comparison (or call API multiple times if needed)
            const allScenarios = scenarios.map(s => ({
                ...s,
                grossCost: formData.emissions * s.price, // Simple calc for comparison
                costToRevenue: formData.eu_export > 0 ? (formData.emissions * s.price / formData.eu_export) * 100 : 0
            }))

            setResult({
                scenario: formData.scenario,
                carbonPrice,
                emissions: formData.emissions,
                grossCost,
                costToRevenue,
                allScenarios,
                details: apiResult // Store full API details if needed
            })

            // Move to result step
            setCurrentStep(3)
        } catch (err) {
            console.error('Calculation error:', err)
        } finally {
            setLoading(false)
        }
    }

    const getRiskLevel = (ratio) => {
        const levels = language === 'tr'
            ? { critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük' }
            : { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }

        if (ratio > 5) return { level: levels.critical, class: 'danger', icon: '🔴' }
        if (ratio > 3) return { level: levels.high, class: 'warning', icon: '🟠' }
        if (ratio > 1) return { level: levels.medium, class: 'medium', icon: '🟡' }
        return { level: levels.low, class: 'success', icon: '🟢' }
    }


    return (
        <div>
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <a href="/">Dashboard</a>
                <span className="separator">/</span>
                <span className="current">
                    {language === 'tr' ? 'CBAM Hesaplayıcı' : 'CBAM Calculator'}
                </span>
            </div>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>💰 {language === 'tr' ? 'CBAM Maliyet Hesaplayıcı' : 'CBAM Cost Calculator'}</h1>
                    <p className="text-muted">
                        {language === 'tr'
                            ? 'Karbon Sınır Düzenleme Mekanizması maliyet projeksiyonu'
                            : 'Carbon Border Adjustment Mechanism cost projection'}
                    </p>
                </div>
            </div>

            {/* Stepper */}
            <div className="card mb-4">
                <div className="card-body">
                    <Stepper
                        steps={steps}
                        currentStep={currentStep}
                        onChange={setCurrentStep}
                        clickable
                    />
                    <div style={{ marginTop: '16px' }}>
                        <ProgressBar
                            value={(currentStep + 1) / steps.length * 100}
                            height={6}
                            striped
                            animated
                        />
                    </div>
                </div>
            </div>

            <div className="calculator-grid">
                {/* Input Section */}
                <div className="card">
                    <div className="card-header">
                        <span>📝</span> {language === 'tr' ? 'Hesaplama Parametreleri' : 'Calculation Parameters'}
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label>{language === 'tr' ? 'Yıllık Emisyon (tCO2e)' : 'Annual Emissions (tCO2e)'}</label>
                            <input
                                type="number"
                                name="emissions"
                                value={formData.emissions}
                                onChange={handleChange}
                                min="0"
                            />
                            <span className="input-hint">
                                {language === 'tr' ? 'Toplam Scope 1 + Scope 2 + Scope 3' : 'Total Scope 1 + Scope 2 + Scope 3'}
                            </span>
                        </div>

                        <div className="form-group">
                            <label>{language === 'tr' ? 'AB İhracat Geliri (€)' : 'EU Export Revenue (€)'}</label>
                            <input
                                type="number"
                                name="eu_export"
                                value={formData.eu_export}
                                onChange={handleChange}
                                min="0"
                            />
                            <span className="input-hint">
                                {language === 'tr' ? 'Yıllık AB\'ye ihracat tutarı' : 'Annual EU export amount'}
                            </span>
                        </div>

                        <div className="form-group">
                            <label>{language === 'tr' ? 'Senaryo' : 'Scenario'}</label>
                            <div className="scenario-cards">
                                {scenarios.map(s => (
                                    <div
                                        key={s.id}
                                        className={`scenario-card ${formData.scenario === s.id ? 'selected' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, scenario: s.id }))}
                                    >
                                        <strong>{s.name}</strong>
                                        <span className="scenario-price">€{s.price}/tCO2</span>
                                        <p>{s.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-block"
                            onClick={calculateCost}
                            disabled={loading}
                        >
                            {loading
                                ? (language === 'tr' ? 'Hesaplanıyor...' : 'Calculating...')
                                : (language === 'tr' ? '🧮 CBAM Maliyetini Hesapla' : '🧮 Calculate CBAM Cost')}
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div>
                    {result ? (
                        <>
                            <div className="card mb-4">
                                <div className="card-header result-header">
                                    <span>📊</span> {language === 'tr' ? 'Hesaplama Sonucu' : 'Calculation Result'}
                                </div>
                                <div className="card-body">
                                    <div className="result-main">
                                        <div className="result-value">
                                            <span className="label">
                                                {language === 'tr' ? 'Tahmini CBAM Maliyeti' : 'Estimated CBAM Cost'}
                                            </span>
                                            <span className="value">€{result.grossCost?.toLocaleString() || '0'}</span>
                                            <span className="sublabel">/ {language === 'tr' ? 'yıl' : 'year'}</span>
                                        </div>

                                        <div className={`risk-indicator ${getRiskLevel(result.costToRevenue).class}`}>
                                            <span className="risk-icon">{getRiskLevel(result.costToRevenue).icon}</span>
                                            <span className="risk-text">
                                                {language === 'tr' ? 'Risk' : 'Risk'}: {getRiskLevel(result.costToRevenue).level}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="result-details">
                                        <div className="detail-row">
                                            <span>{language === 'tr' ? 'Karbon Fiyatı' : 'Carbon Price'}</span>
                                            <strong>€{result.carbonPrice}/tCO2</strong>
                                        </div>
                                        <div className="detail-row">
                                            <span>{language === 'tr' ? 'Toplam Emisyon' : 'Total Emissions'}</span>
                                            <strong>{result.emissions?.toLocaleString() || '0'} tCO2e</strong>
                                        </div>
                                        <div className="detail-row highlight">
                                            <span>{language === 'tr' ? 'İhracata Oran' : 'Export Ratio'}</span>
                                            <strong>%{result.costToRevenue?.toFixed(2) || '0.00'}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* All Scenarios Comparison */}
                            <div className="card mb-4">
                                <div className="card-header">
                                    <span>📈</span> {language === 'tr' ? 'Senaryo Karşılaştırması' : 'Scenario Comparison'}
                                </div>
                                <div className="card-body">
                                    <div className="scenario-comparison">
                                        {result.allScenarios.map(s => (
                                            <div
                                                key={s.id}
                                                className={`comparison-bar ${s.id === result.scenario ? 'active' : ''}`}
                                            >
                                                <div className="comparison-label">
                                                    <span>{s.name}</span>
                                                    <span>€{s.price}/tCO2</span>
                                                </div>
                                                <div className="comparison-value">
                                                    <div
                                                        className={`bar ${s.id.toLowerCase()}`}
                                                        style={{
                                                            width: `${(s.grossCost / result.allScenarios[2].grossCost) * 100}%`
                                                        }}
                                                    ></div>
                                                    <span>€{s.grossCost?.toLocaleString() || '0'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="card">
                                <div className="card-header">
                                    <span>💡</span> Öneriler
                                </div>
                                <div className="card-body">
                                    <ul className="recommendation-list-simple">
                                        {result.costToRevenue > 5 && (
                                            <li className="urgent">
                                                ⚠️ CBAM maliyetiniz yüksek - acil emisyon azaltım stratejisi gerekli
                                            </li>
                                        )}
                                        <li>
                                            🌱 Yenilenebilir enerji yatırımı ile Scope 2 emisyonlarını azaltın
                                        </li>
                                        <li>
                                            🏦 Yeşil kredi seçeneklerini değerlendirin (düşük faizli CBAM finansmanı)
                                        </li>
                                        <li>
                                            📊 Üretim süreçlerinde enerji verimliliği analizi yapın
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="card">
                            <div className="card-body empty-state">
                                <span className="empty-icon">🧮</span>
                                <h3>CBAM Maliyetinizi Hesaplayın</h3>
                                <p>Sol taraftaki formu doldurup hesapla butonuna tıklayın</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            <div className="info-cards">
                <div className="info-card">
                    <span className="info-icon">📅</span>
                    <h4>CBAM Takvimi</h4>
                    <p>2026'dan itibaren kademeli uygulama başlayacak, 2034'te tam ödeme zorunlu olacak.</p>
                </div>
                <div className="info-card">
                    <span className="info-icon">🏭</span>
                    <h4>Kapsam</h4>
                    <p>Çelik, demir, alüminyum, çimento, gübre, hidrojen ve elektrik sektörleri.</p>
                </div>
                <div className="info-card">
                    <span className="info-icon">💶</span>
                    <h4>Hesaplama</h4>
                    <p>CBAM Maliyeti = Emisyon (tCO2) × AB ETS Karbon Fiyatı (€/tCO2)</p>
                </div>
            </div>
        </div>
    )
}

export default CBAMCalculator
