import { useState } from 'react'
import {
    BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useLanguage } from '../contexts/LanguageContext'

const CompanyComparison = () => {
    const { language } = useLanguage()
    const [selectedCompanies, setSelectedCompanies] = useState([1, 2])

    // Sample company data
    const companies = [
        {
            id: 1,
            name: 'Anadolu Demir Çelik',
            sector: language === 'tr' ? 'Demir-Çelik' : 'Iron-Steel',
            emissions: { scope1: 45000, scope2: 12000, scope3: 4000, total: 61000 },
            cbamCost: 5490000,
            riskScore: 75,
            efficiency: 1.2,
            greenInvestment: 2500000
        },
        {
            id: 2,
            name: 'Ege Alüminyum',
            sector: language === 'tr' ? 'Alüminyum' : 'Aluminum',
            emissions: { scope1: 30000, scope2: 10000, scope3: 5000, total: 45000 },
            cbamCost: 4050000,
            riskScore: 45,
            efficiency: 0.9,
            greenInvestment: 3200000
        },
        {
            id: 3,
            name: 'Marmara Çimento',
            sector: language === 'tr' ? 'Çimento' : 'Cement',
            emissions: { scope1: 85000, scope2: 25000, scope3: 10000, total: 120000 },
            cbamCost: 10800000,
            riskScore: 90,
            efficiency: 1.5,
            greenInvestment: 1800000
        },
        {
            id: 4,
            name: 'Trakya Gübre',
            sector: language === 'tr' ? 'Gübre' : 'Fertilizer',
            emissions: { scope1: 25000, scope2: 8000, scope3: 5000, total: 38000 },
            cbamCost: 3420000,
            riskScore: 40,
            efficiency: 0.8,
            greenInvestment: 4100000
        },
    ]

    const sectorAverages = {
        'Demir-Çelik': { emissions: 55000, efficiency: 1.3 },
        'Alüminyum': { emissions: 50000, efficiency: 1.1 },
        'Çimento': { emissions: 100000, efficiency: 1.4 },
        'Gübre': { emissions: 42000, efficiency: 0.9 },
        'Iron-Steel': { emissions: 55000, efficiency: 1.3 },
        'Aluminum': { emissions: 50000, efficiency: 1.1 },
        'Cement': { emissions: 100000, efficiency: 1.4 },
        'Fertilizer': { emissions: 42000, efficiency: 0.9 },
    }

    const selectedData = companies.filter(c => selectedCompanies.includes(c.id))

    const emissionComparisonData = selectedData.map(c => ({
        name: c.name.split(' ')[0],
        'Scope 1': c.emissions.scope1,
        'Scope 2': c.emissions.scope2,
        'Scope 3': c.emissions.scope3,
    }))

    const radarMetrics = language === 'tr'
        ? ['Emisyon Yoğunluğu', 'Risk Skoru', 'Yeşil Yatırım', 'CBAM Hazırlık', 'Verimlilik']
        : ['Emission Intensity', 'Risk Score', 'Green Investment', 'CBAM Readiness', 'Efficiency']

    const radarData = [
        { metric: radarMetrics[0], ...Object.fromEntries(selectedData.map(c => [c.name.split(' ')[0], c.efficiency * 50])) },
        { metric: radarMetrics[1], ...Object.fromEntries(selectedData.map(c => [c.name.split(' ')[0], c.riskScore])) },
        { metric: radarMetrics[2], ...Object.fromEntries(selectedData.map(c => [c.name.split(' ')[0], c.greenInvestment / 50000])) },
        { metric: radarMetrics[3], ...Object.fromEntries(selectedData.map(c => [c.name.split(' ')[0], 100 - c.riskScore])) },
        { metric: radarMetrics[4], ...Object.fromEntries(selectedData.map(c => [c.name.split(' ')[0], (1.5 - c.efficiency) * 80])) },
    ]

    const toggleCompany = (id) => {
        if (selectedCompanies.includes(id)) {
            if (selectedCompanies.length > 1) {
                setSelectedCompanies(selectedCompanies.filter(c => c !== id))
            }
        } else {
            if (selectedCompanies.length < 4) {
                setSelectedCompanies([...selectedCompanies, id])
            }
        }
    }

    const COLORS = ['#00874A', '#004481', '#F39200', '#E53E3E']

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>🔄 {language === 'tr' ? 'Şirket Karşılaştırma' : 'Company Comparison'}</h1>
                    <p className="text-muted">
                        {language === 'tr'
                            ? 'Şirketlerinizi yan yana karşılaştırın ve benchmark analizi yapın'
                            : 'Compare your companies side by side and perform benchmark analysis'}
                    </p>
                </div>
            </div>

            {/* Company Selection */}
            <div className="card mb-4">
                <div className="card-header">
                    <span>🏢</span> {language === 'tr' ? 'Karşılaştırılacak Şirketleri Seçin (Max 4)' : 'Select Companies to Compare (Max 4)'}
                </div>
                <div className="card-body">
                    <div className="company-selector">
                        {companies.map(company => (
                            <div
                                key={company.id}
                                className={`selector-chip ${selectedCompanies.includes(company.id) ? 'selected' : ''}`}
                                onClick={() => toggleCompany(company.id)}
                            >
                                <span className="chip-check">
                                    {selectedCompanies.includes(company.id) ? '✓' : ''}
                                </span>
                                <span>{company.name}</span>
                                <span className="chip-sector">{company.sector}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="comparison-grid">
                {/* Emission Comparison Chart */}
                <div className="card chart-card">
                    <div className="card-header">
                        <span>📊</span> {language === 'tr' ? 'Emisyon Karşılaştırması (tCO2e)' : 'Emission Comparison (tCO2e)'}
                    </div>
                    <div className="card-body chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={emissionComparisonData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value.toLocaleString()} tCO2e`} />
                                <Legend />
                                <Bar dataKey="Scope 1" fill="#00874A" />
                                <Bar dataKey="Scope 2" fill="#004481" />
                                <Bar dataKey="Scope 3" fill="#F39200" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="card chart-card">
                    <div className="card-header">
                        <span>🎯</span> {language === 'tr' ? 'Performans Karşılaştırması' : 'Performance Comparison'}
                    </div>
                    <div className="card-body chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                {selectedData.map((company, index) => (
                                    <Radar
                                        key={company.id}
                                        name={company.name.split(' ')[0]}
                                        dataKey={company.name.split(' ')[0]}
                                        stroke={COLORS[index]}
                                        fill={COLORS[index]}
                                        fillOpacity={0.3}
                                    />
                                ))}
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Comparison Table */}
            <div className="card mt-4">
                <div className="card-header">
                    <span>📋</span> {language === 'tr' ? 'Detaylı Karşılaştırma' : 'Detailed Comparison'}
                </div>
                <div className="card-body">
                    <table className="comparison-table">
                        <thead>
                            <tr>
                                <th>Metrik</th>
                                {selectedData.map(c => (
                                    <th key={c.id}>{c.name}</th>
                                ))}
                                <th>Sektör Ort.</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Toplam Emisyon</td>
                                {selectedData.map(c => (
                                    <td key={c.id}>
                                        <strong>{c.emissions.total.toLocaleString()}</strong> tCO2e
                                    </td>
                                ))}
                                <td className="avg-cell">
                                    {Math.round(selectedData.reduce((sum, c) => sum + sectorAverages[c.sector].emissions, 0) / selectedData.length).toLocaleString()} tCO2e
                                </td>
                            </tr>
                            <tr>
                                <td>CBAM Maliyeti</td>
                                {selectedData.map(c => (
                                    <td key={c.id}>
                                        <strong>€{(c.cbamCost / 1000000).toFixed(1)}M</strong>
                                    </td>
                                ))}
                                <td className="avg-cell">-</td>
                            </tr>
                            <tr>
                                <td>Risk Skoru</td>
                                {selectedData.map(c => (
                                    <td key={c.id}>
                                        <span className={`risk-indicator ${c.riskScore > 70 ? 'high' : c.riskScore > 40 ? 'medium' : 'low'}`}>
                                            {c.riskScore}/100
                                        </span>
                                    </td>
                                ))}
                                <td className="avg-cell">50/100</td>
                            </tr>
                            <tr>
                                <td>Emisyon Yoğunluğu</td>
                                {selectedData.map(c => (
                                    <td key={c.id}>
                                        <strong>{c.efficiency}</strong> tCO2e/ton
                                    </td>
                                ))}
                                <td className="avg-cell">
                                    {(selectedData.reduce((sum, c) => sum + sectorAverages[c.sector].efficiency, 0) / selectedData.length).toFixed(2)} tCO2e/ton
                                </td>
                            </tr>
                            <tr>
                                <td>Yeşil Yatırım</td>
                                {selectedData.map(c => (
                                    <td key={c.id}>
                                        <strong>€{(c.greenInvestment / 1000000).toFixed(1)}M</strong>
                                    </td>
                                ))}
                                <td className="avg-cell">€2.5M</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recommendations */}
            <div className="card mt-4">
                <div className="card-header">
                    <span>💡</span> AI Önerileri
                </div>
                <div className="card-body">
                    <div className="recommendations-list">
                        {selectedData.map(c => (
                            <div key={c.id} className="recommendation-item">
                                <h4>{c.name}</h4>
                                {c.riskScore > 70 ? (
                                    <p className="text-danger">
                                        ⚠️ Yüksek risk skoru. Scope 1 emisyonlarını azaltmak için yeşil enerji yatırımı önerilir.
                                        Tahmini CBAM tasarrufu: <strong>€{((c.cbamCost * 0.15) / 1000000).toFixed(1)}M/yıl</strong>
                                    </p>
                                ) : c.riskScore > 40 ? (
                                    <p className="text-warning">
                                        📊 Orta seviye risk. Enerji verimliliği projelerine yatırım yaparak emisyon yoğunluğunu düşürebilirsiniz.
                                    </p>
                                ) : (
                                    <p className="text-success">
                                        ✅ Düşük risk profili. Mevcut stratejinizi sürdürerek rekabet avantajınızı koruyabilirsiniz.
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompanyComparison
