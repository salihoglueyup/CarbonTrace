import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { emissionsAPI, companiesAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const EmissionDetail = () => {
    const { companyId } = useParams()
    const { user } = useAuth()
    const [company, setCompany] = useState(null)
    const [emissions, setEmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                let targetCompanyId = companyId

                // Eğer URL'de ID yoksa ve kullanıcı bir şirkete bağlıysa onu kullan
                if (!targetCompanyId && user?.company_id) {
                    targetCompanyId = user.company_id
                }

                // Hala ID yoksa (örn: admin ve parametresiz gelmişse), şirketleri çekip ilkini al
                if (!targetCompanyId) {
                    const companies = await companiesAPI.getAll()
                    if (companies.length > 0) {
                        targetCompanyId = companies[0].id
                    }
                }

                if (targetCompanyId) {
                    const [companyData, emissionsData] = await Promise.all([
                        companiesAPI.getById(targetCompanyId),
                        emissionsAPI.getByCompany(targetCompanyId)
                    ])

                    setCompany(companyData)

                    // Backend verisini frontend formatına dönüştür
                    const formattedEmissions = emissionsData.map(e => ({
                        year: e.year,
                        scope1: e.scope1_emissions,
                        scope2: e.scope2_emissions,
                        scope3: e.scope3_emissions,
                        intensity: e.emission_intensity || 0,
                        verified: e.is_verified
                    }))

                    setEmissions(formattedEmissions)

                    // En son yılı seç
                    if (formattedEmissions.length > 0) {
                        const maxYear = Math.max(...formattedEmissions.map(e => e.year))
                        setSelectedYear(maxYear)
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [companyId, user])

    const selectedEmission = emissions.find(e => e.year === selectedYear) || emissions[0]
    const totalEmissions = selectedEmission ?
        selectedEmission.scope1 + selectedEmission.scope2 + selectedEmission.scope3 : 0

    // Calculate percentages for pie chart simulation
    const scope1Percent = selectedEmission ? Math.round((selectedEmission.scope1 / totalEmissions) * 100) : 0
    const scope2Percent = selectedEmission ? Math.round((selectedEmission.scope2 / totalEmissions) * 100) : 0
    const scope3Percent = selectedEmission ? Math.round((selectedEmission.scope3 / totalEmissions) * 100) : 0

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Emisyon verileri yükleniyor...</p>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <Link to="/companies" className="back-link">← Şirketlere Dön</Link>
                    <h1>🌿 Emisyon Analizi</h1>
                    <p className="text-muted">{company?.name || 'Tüm Şirketler'}</p>
                </div>
                <div className="year-selector">
                    <label>Yıl:</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        {emissions.map(e => (
                            <option key={e.year} value={e.year}>{e.year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon green">🌍</div>
                    <div className="stat-content">
                        <h4>Toplam Emisyon</h4>
                        <div className="value">{totalEmissions.toLocaleString()} tCO2e</div>
                        <div className="change positive">↓ %7.3 önceki yıla göre</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">🏭</div>
                    <div className="stat-content">
                        <h4>Emisyon Yoğunluğu</h4>
                        <div className="value">{selectedEmission?.intensity || 0} tCO2e/M€</div>
                        <div className="change positive">↓ Sektör ortalamasının altında</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">✅</div>
                    <div className="stat-content">
                        <h4>Doğrulama Durumu</h4>
                        <div className="value">{selectedEmission?.verified ? 'Doğrulanmış' : 'Beklemede'}</div>
                        <div className="change">ISO 14064 standardı</div>
                    </div>
                </div>
            </div>

            {/* Scope Breakdown */}
            <div className="dashboard-grid">
                {/* Scope Cards */}
                <div>
                    <div className="card mb-4">
                        <div className="card-header">
                            <span>📊</span> Scope Dağılımı ({selectedYear})
                        </div>
                        <div className="card-body">
                            <div className="scope-breakdown">
                                {/* Scope 1 */}
                                <div className="scope-item">
                                    <div className="scope-header">
                                        <span className="scope-badge scope1">Scope 1</span>
                                        <span className="scope-value">{selectedEmission?.scope1?.toLocaleString()} tCO2e</span>
                                    </div>
                                    <p className="scope-desc">Doğrudan emisyonlar (fabrika, araçlar)</p>
                                    <div className="progress">
                                        <div className="progress-bar green" style={{ width: `${scope1Percent}%` }}></div>
                                    </div>
                                    <span className="scope-percent">{scope1Percent}%</span>
                                </div>

                                {/* Scope 2 */}
                                <div className="scope-item">
                                    <div className="scope-header">
                                        <span className="scope-badge scope2">Scope 2</span>
                                        <span className="scope-value">{selectedEmission?.scope2?.toLocaleString()} tCO2e</span>
                                    </div>
                                    <p className="scope-desc">Dolaylı emisyonlar (satın alınan elektrik)</p>
                                    <div className="progress">
                                        <div className="progress-bar blue" style={{ width: `${scope2Percent}%` }}></div>
                                    </div>
                                    <span className="scope-percent">{scope2Percent}%</span>
                                </div>

                                {/* Scope 3 */}
                                <div className="scope-item">
                                    <div className="scope-header">
                                        <span className="scope-badge scope3">Scope 3</span>
                                        <span className="scope-value">{selectedEmission?.scope3?.toLocaleString()} tCO2e</span>
                                    </div>
                                    <p className="scope-desc">Tedarik zinciri emisyonları</p>
                                    <div className="progress">
                                        <div className="progress-bar orange" style={{ width: `${scope3Percent}%` }}></div>
                                    </div>
                                    <span className="scope-percent">{scope3Percent}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Yearly Comparison Table */}
                    <div className="card">
                        <div className="card-header">
                            <span>📈</span> Yıllık Karşılaştırma
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Yıl</th>
                                        <th>Scope 1</th>
                                        <th>Scope 2</th>
                                        <th>Scope 3</th>
                                        <th>Toplam</th>
                                        <th>Değişim</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {emissions.map((e, idx) => {
                                        const total = e.scope1 + e.scope2 + e.scope3
                                        const prevTotal = emissions[idx + 1] ?
                                            emissions[idx + 1].scope1 + emissions[idx + 1].scope2 + emissions[idx + 1].scope3 : null
                                        const change = prevTotal ? ((total - prevTotal) / prevTotal * 100).toFixed(1) : null

                                        return (
                                            <tr key={e.year} className={e.year === selectedYear ? 'selected-row' : ''}>
                                                <td><strong>{e.year}</strong></td>
                                                <td>{e.scope1.toLocaleString()}</td>
                                                <td>{e.scope2.toLocaleString()}</td>
                                                <td>{e.scope3.toLocaleString()}</td>
                                                <td><strong>{total.toLocaleString()}</strong></td>
                                                <td>
                                                    {change !== null ? (
                                                        <span className={`change ${parseFloat(change) < 0 ? 'positive' : 'negative'}`}>
                                                            {parseFloat(change) < 0 ? '↓' : '↑'} {Math.abs(change)}%
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column - Recommendations */}
                <div>
                    <div className="card mb-4">
                        <div className="card-header">
                            <span>💡</span> Emisyon Azaltım Önerileri
                        </div>
                        <div className="card-body">
                            <div className="recommendation-list">
                                <div className="recommendation-item high">
                                    <span className="rec-icon">⚡</span>
                                    <div>
                                        <strong>Güneş Enerjisi Yatırımı</strong>
                                        <p>Scope 2 emisyonlarını %40 azaltabilir</p>
                                        <span className="rec-impact">-4,600 tCO2e/yıl</span>
                                    </div>
                                </div>
                                <div className="recommendation-item medium">
                                    <span className="rec-icon">🔄</span>
                                    <div>
                                        <strong>Proses Optimizasyonu</strong>
                                        <p>Enerji verimliliği iyileştirmesi</p>
                                        <span className="rec-impact">-2,100 tCO2e/yıl</span>
                                    </div>
                                </div>
                                <div className="recommendation-item low">
                                    <span className="rec-icon">🚛</span>
                                    <div>
                                        <strong>Lojistik Optimizasyonu</strong>
                                        <p>Tedarik zinciri karbon ayak izi</p>
                                        <span className="rec-impact">-750 tCO2e/yıl</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <span>🎯</span> Sektör Karşılaştırması
                        </div>
                        <div className="card-body">
                            <div className="benchmark-item">
                                <span>Şirket Emisyon Yoğunluğu</span>
                                <strong>{selectedEmission?.intensity} tCO2e/M€</strong>
                            </div>
                            <div className="benchmark-item">
                                <span>Sektör Ortalaması</span>
                                <strong>420 tCO2e/M€</strong>
                            </div>
                            <div className="benchmark-item highlight">
                                <span>Performans</span>
                                <strong className="positive">%9.5 daha iyi</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmissionDetail
