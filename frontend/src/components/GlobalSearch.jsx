import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const GlobalSearch = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState({
        companies: [],
        suppliers: [],
        documents: [],
        reports: []
    })
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('all')
    const navigate = useNavigate()

    // Mock search data
    const searchData = {
        companies: [
            { id: 1, name: 'Anadolu Demir Çelik', sector: 'Demir-Çelik', emissions: 61000 },
            { id: 2, name: 'Ege Alüminyum', sector: 'Alüminyum', emissions: 45000 },
            { id: 3, name: 'Marmara Çimento', sector: 'Çimento', emissions: 120000 },
            { id: 4, name: 'Trakya Gübre', sector: 'Gübre', emissions: 38000 },
        ],
        suppliers: [
            { id: 1, name: 'Çelik Hammadde A.Ş.', country: 'Türkiye', risk: 'medium' },
            { id: 2, name: 'Balkan Steel Import', country: 'Bulgaristan', risk: 'high' },
            { id: 3, name: 'EcoEnergy Solutions', country: 'Almanya', risk: 'low' },
        ],
        documents: [
            { id: 1, name: 'emissions_2024.xlsx', type: 'Excel', date: '2024-01-15' },
            { id: 2, name: 'cbam_report_q1.pdf', type: 'PDF', date: '2024-04-30' },
            { id: 3, name: 'supplier_audit.pdf', type: 'PDF', date: '2024-02-10' },
        ],
        reports: [
            { id: 1, name: 'Q1 2024 Emisyon Raporu', type: 'emission', date: '2024-04-15' },
            { id: 2, name: 'CBAM Maliyet Analizi', type: 'cbam', date: '2024-03-20' },
            { id: 3, name: 'Yeşil Finansman Özeti', type: 'financial', date: '2024-02-28' },
        ]
    }

    useEffect(() => {
        if (query.length >= 2) {
            setLoading(true)
            // Simulate search delay
            const timer = setTimeout(() => {
                const q = query.toLowerCase()
                setResults({
                    companies: searchData.companies.filter(c =>
                        c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q)
                    ),
                    suppliers: searchData.suppliers.filter(s =>
                        s.name.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)
                    ),
                    documents: searchData.documents.filter(d =>
                        d.name.toLowerCase().includes(q)
                    ),
                    reports: searchData.reports.filter(r =>
                        r.name.toLowerCase().includes(q)
                    )
                })
                setLoading(false)
            }, 300)
            return () => clearTimeout(timer)
        } else {
            setResults({ companies: [], suppliers: [], documents: [], reports: [] })
        }
    }, [query])

    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0)

    const handleResultClick = (type, item) => {
        switch (type) {
            case 'companies':
                navigate(`/companies?id=${item.id}`)
                break
            case 'suppliers':
                navigate(`/suppliers?id=${item.id}`)
                break
            case 'documents':
                navigate(`/documents?id=${item.id}`)
                break
            case 'reports':
                navigate(`/reports?id=${item.id}`)
                break
        }
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="search-overlay" onClick={onClose}>
            <div className="search-modal" onClick={e => e.stopPropagation()}>
                <div className="search-header">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Şirket, tedarikçi, doküman ara..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                    <button className="search-close" onClick={onClose}>×</button>
                </div>

                {query.length >= 2 && (
                    <>
                        <div className="search-tabs">
                            <button
                                className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                Tümü ({totalResults})
                            </button>
                            <button
                                className={`search-tab ${activeTab === 'companies' ? 'active' : ''}`}
                                onClick={() => setActiveTab('companies')}
                            >
                                🏢 Şirketler ({results.companies.length})
                            </button>
                            <button
                                className={`search-tab ${activeTab === 'suppliers' ? 'active' : ''}`}
                                onClick={() => setActiveTab('suppliers')}
                            >
                                🏭 Tedarikçiler ({results.suppliers.length})
                            </button>
                            <button
                                className={`search-tab ${activeTab === 'documents' ? 'active' : ''}`}
                                onClick={() => setActiveTab('documents')}
                            >
                                📎 Dokümanlar ({results.documents.length})
                            </button>
                        </div>

                        <div className="search-results">
                            {loading ? (
                                <div className="search-loading">Aranıyor...</div>
                            ) : totalResults === 0 ? (
                                <div className="search-empty">
                                    <span>🔍</span>
                                    <p>"{query}" için sonuç bulunamadı</p>
                                </div>
                            ) : (
                                <>
                                    {(activeTab === 'all' || activeTab === 'companies') && results.companies.length > 0 && (
                                        <div className="result-group">
                                            <div className="result-group-title">🏢 Şirketler</div>
                                            {results.companies.map(company => (
                                                <div
                                                    key={company.id}
                                                    className="result-item"
                                                    onClick={() => handleResultClick('companies', company)}
                                                >
                                                    <div className="result-main">
                                                        <strong>{company.name}</strong>
                                                        <span className="result-meta">{company.sector}</span>
                                                    </div>
                                                    <span className="result-badge">{company.emissions.toLocaleString()} tCO2e</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {(activeTab === 'all' || activeTab === 'suppliers') && results.suppliers.length > 0 && (
                                        <div className="result-group">
                                            <div className="result-group-title">🏭 Tedarikçiler</div>
                                            {results.suppliers.map(supplier => (
                                                <div
                                                    key={supplier.id}
                                                    className="result-item"
                                                    onClick={() => handleResultClick('suppliers', supplier)}
                                                >
                                                    <div className="result-main">
                                                        <strong>{supplier.name}</strong>
                                                        <span className="result-meta">{supplier.country}</span>
                                                    </div>
                                                    <span className={`result-badge ${supplier.risk}`}>
                                                        {supplier.risk === 'high' ? 'Yüksek Risk' : supplier.risk === 'medium' ? 'Orta Risk' : 'Düşük Risk'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {(activeTab === 'all' || activeTab === 'documents') && results.documents.length > 0 && (
                                        <div className="result-group">
                                            <div className="result-group-title">📎 Dokümanlar</div>
                                            {results.documents.map(doc => (
                                                <div
                                                    key={doc.id}
                                                    className="result-item"
                                                    onClick={() => handleResultClick('documents', doc)}
                                                >
                                                    <div className="result-main">
                                                        <strong>{doc.name}</strong>
                                                        <span className="result-meta">{doc.date}</span>
                                                    </div>
                                                    <span className="result-badge">{doc.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}

                {query.length < 2 && (
                    <div className="search-hint">
                        <p>En az 2 karakter girin</p>
                        <div className="search-shortcuts">
                            <span><kbd>Ctrl</kbd>+<kbd>K</kbd> Command Palette</span>
                            <span><kbd>Ctrl</kbd>+<kbd>/</kbd> Arama</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default GlobalSearch
