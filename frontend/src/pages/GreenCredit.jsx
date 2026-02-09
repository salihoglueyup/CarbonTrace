import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const GreenCredit = () => {
    const { language } = useLanguage()
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [showApplicationForm, setShowApplicationForm] = useState(false)
    const [roiCalculator, setRoiCalculator] = useState({
        investment: 1000000,
        annualSaving: 200000,
        years: 5
    })

    const creditProducts = language === 'tr' ? [
        {
            id: 1,
            name: 'Yeşil Enerji Kredisi',
            icon: '☀️',
            interestRate: 1.49,
            maxTerm: 84,
            minAmount: 100000,
            maxAmount: 20000000,
            description: 'Güneş, rüzgar ve diğer yenilenebilir enerji yatırımları için özel kredi',
            features: ['Düşük faiz oranı', '7 yıla varan vade', 'Hızlı onay süreci', '6 ay ödemesiz dönem'],
            suitableFor: ['Güneş enerjisi santrali', 'Rüzgar türbini', 'Biyogaz tesisi'],
            color: 'green'
        },
        {
            id: 2,
            name: 'Enerji Verimliliği Kredisi',
            icon: '⚡',
            interestRate: 1.79,
            maxTerm: 60,
            minAmount: 50000,
            maxAmount: 10000000,
            description: 'Üretim süreçlerinde enerji verimliliği sağlayan yatırımlar için',
            features: ['Rekabetçi faiz', '5 yıl vade', 'Esnek ödeme planı', 'Teknik danışmanlık'],
            suitableFor: ['LED aydınlatma', 'Motor değişimi', 'Isı yalıtımı'],
            color: 'blue'
        },
        {
            id: 3,
            name: 'Temiz Teknoloji Kredisi',
            icon: '🔧',
            interestRate: 1.99,
            maxTerm: 72,
            minAmount: 200000,
            maxAmount: 15000000,
            description: 'Düşük karbonlu üretim teknolojilerine geçiş için',
            features: ['Uzun vade', 'Düşük teminat', 'CBAM uyumlu', 'Emisyon azaltım garantisi'],
            suitableFor: ['Elektrikli fırın', 'Hidrojen teknolojisi', 'Karbon yakalama'],
            color: 'orange'
        }
    ] : [
        {
            id: 1,
            name: 'Green Energy Loan',
            icon: '☀️',
            interestRate: 1.49,
            maxTerm: 84,
            minAmount: 100000,
            maxAmount: 20000000,
            description: 'Special loan for solar, wind and other renewable energy investments',
            features: ['Low interest rate', 'Up to 7 years term', 'Fast approval process', '6 months grace period'],
            suitableFor: ['Solar power plant', 'Wind turbine', 'Biogas facility'],
            color: 'green'
        },
        {
            id: 2,
            name: 'Energy Efficiency Loan',
            icon: '⚡',
            interestRate: 1.79,
            maxTerm: 60,
            minAmount: 50000,
            maxAmount: 10000000,
            description: 'For investments that improve energy efficiency in production processes',
            features: ['Competitive rates', '5 year term', 'Flexible payment plan', 'Technical consulting'],
            suitableFor: ['LED lighting', 'Motor replacement', 'Thermal insulation'],
            color: 'blue'
        },
        {
            id: 3,
            name: 'Clean Technology Loan',
            icon: '🔧',
            interestRate: 1.99,
            maxTerm: 72,
            minAmount: 200000,
            maxAmount: 15000000,
            description: 'For transition to low-carbon production technologies',
            features: ['Long term', 'Low collateral', 'CBAM compliant', 'Emission reduction guarantee'],
            suitableFor: ['Electric furnace', 'Hydrogen technology', 'Carbon capture'],
            color: 'orange'
        }
    ]

    const calculateROI = () => {
        const totalReturn = roiCalculator.annualSaving * roiCalculator.years
        const netReturn = totalReturn - roiCalculator.investment
        const roi = (netReturn / roiCalculator.investment) * 100
        const paybackYears = roiCalculator.investment / roiCalculator.annualSaving

        return { totalReturn, netReturn, roi, paybackYears }
    }

    const roiResult = calculateROI()

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <a href="/">Dashboard</a>
                <span className="separator">/</span>
                <span className="current">{language === 'tr' ? 'Yeşil Kredi' : 'Green Credit'}</span>
            </div>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>🏦 {language === 'tr' ? 'Yeşil Kredi' : 'Green Credit'}</h1>
                    <p className="text-muted">
                        {language === 'tr'
                            ? 'CBAM uyumlu yeşil finansman çözümleri'
                            : 'CBAM-compliant green financing solutions'}
                    </p>
                </div>
            </div>

            {/* Credit Products */}
            <div className="credit-products-grid">
                {creditProducts.map(product => (
                    <div
                        key={product.id}
                        className={`credit-product-card ${product.color} ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                        onClick={() => setSelectedProduct(product)}
                    >
                        <div className="product-icon">{product.icon}</div>
                        <h3>{product.name}</h3>
                        <div className="product-rate">
                            <span className="rate">%{product.interestRate}</span>
                            <span className="rate-label">yıllık faiz</span>
                        </div>
                        <p>{product.description}</p>
                        <div className="product-details">
                            <span>📅 {product.maxTerm} ay vade</span>
                            <span>💶 €{(product.maxAmount / 1000000).toFixed(0)}M'a kadar</span>
                        </div>
                        <button className="btn btn-outline btn-sm">Detayları Gör</button>
                    </div>
                ))}
            </div>

            <div className="credit-grid">
                {/* Selected Product Details */}
                <div>
                    {selectedProduct ? (
                        <div className="card mb-4">
                            <div className={`card-header ${selectedProduct.color}`}>
                                <span>{selectedProduct.icon}</span> {selectedProduct.name}
                            </div>
                            <div className="card-body">
                                <div className="product-highlight">
                                    <div className="highlight-item">
                                        <span className="highlight-value">%{selectedProduct.interestRate}</span>
                                        <span className="highlight-label">Faiz Oranı</span>
                                    </div>
                                    <div className="highlight-item">
                                        <span className="highlight-value">{selectedProduct.maxTerm}</span>
                                        <span className="highlight-label">Maksimum Vade (ay)</span>
                                    </div>
                                    <div className="highlight-item">
                                        <span className="highlight-value">€{(selectedProduct.maxAmount / 1000000).toFixed(0)}M</span>
                                        <span className="highlight-label">Maks. Tutar</span>
                                    </div>
                                </div>

                                <h4>Özellikler</h4>
                                <ul className="feature-list">
                                    {selectedProduct.features.map((f, i) => (
                                        <li key={i}>✓ {f}</li>
                                    ))}
                                </ul>

                                <h4>Uygun Yatırımlar</h4>
                                <div className="tag-list">
                                    {selectedProduct.suitableFor.map((s, i) => (
                                        <span key={i} className="tag">{s}</span>
                                    ))}
                                </div>

                                <button
                                    className="btn btn-primary btn-block mt-4"
                                    onClick={() => setShowApplicationForm(true)}
                                >
                                    📝 Başvuru Yap
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-body empty-state">
                                <span className="empty-icon">👆</span>
                                <h3>Kredi Ürünü Seçin</h3>
                                <p>Detayları görmek için yukarıdan bir kredi ürünü seçin</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ROI Calculator */}
                <div>
                    <div className="card">
                        <div className="card-header">
                            <span>🧮</span> ROI Hesaplayıcı
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label>Yatırım Tutarı (€)</label>
                                <input
                                    type="number"
                                    value={roiCalculator.investment}
                                    onChange={(e) => setRoiCalculator(prev => ({
                                        ...prev, investment: parseFloat(e.target.value) || 0
                                    }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Yıllık Tasarruf (€)</label>
                                <input
                                    type="number"
                                    value={roiCalculator.annualSaving}
                                    onChange={(e) => setRoiCalculator(prev => ({
                                        ...prev, annualSaving: parseFloat(e.target.value) || 0
                                    }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Süre (Yıl)</label>
                                <input
                                    type="number"
                                    value={roiCalculator.years}
                                    onChange={(e) => setRoiCalculator(prev => ({
                                        ...prev, years: parseInt(e.target.value) || 1
                                    }))}
                                    min="1"
                                    max="20"
                                />
                            </div>

                            <div className="roi-results">
                                <div className="roi-item">
                                    <span>Toplam Getiri</span>
                                    <strong>€{roiResult.totalReturn.toLocaleString()}</strong>
                                </div>
                                <div className="roi-item">
                                    <span>Net Kazanç</span>
                                    <strong className={roiResult.netReturn > 0 ? 'positive' : 'negative'}>
                                        €{roiResult.netReturn.toLocaleString()}
                                    </strong>
                                </div>
                                <div className="roi-item highlight">
                                    <span>ROI</span>
                                    <strong>%{roiResult.roi.toFixed(1)}</strong>
                                </div>
                                <div className="roi-item">
                                    <span>Geri Ödeme Süresi</span>
                                    <strong>{roiResult.paybackYears.toFixed(1)} yıl</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="card mt-4">
                        <div className="card-header">
                            <span>📊</span> Garanti BBVA Yeşil Finansman
                        </div>
                        <div className="card-body">
                            <div className="quick-stats">
                                <div className="quick-stat">
                                    <span className="qs-value">€2.5B+</span>
                                    <span className="qs-label">Yeşil Kredi Hacmi</span>
                                </div>
                                <div className="quick-stat">
                                    <span className="qs-value">1,200+</span>
                                    <span className="qs-label">Finanse Edilen Proje</span>
                                </div>
                                <div className="quick-stat">
                                    <span className="qs-value">2.1M</span>
                                    <span className="qs-label">tCO2 Azaltım</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Modal */}
            {showApplicationForm && selectedProduct && (
                <ApplicationModal
                    product={selectedProduct}
                    onClose={() => setShowApplicationForm(false)}
                />
            )}
        </div>
    )
}

// Application Modal
const ApplicationModal = ({ product, onClose }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        amount: '',
        purpose: '',
        notes: ''
    })
    const [submitted, setSubmitted] = useState(false)
    const [applicationNo] = useState(() => `GC-${Math.floor(Math.random() * 900000 + 100000)}`)

    const handleSubmit = (e) => {
        e.preventDefault()
        // Simulate submission
        setTimeout(() => setSubmitted(true), 500)
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{product.icon} {product.name} Başvurusu</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {submitted ? (
                    <div className="modal-body">
                        <div className="success-message">
                            <div className="success-icon">✅</div>
                            <h3>Başvurunuz Alındı!</h3>
                            <p>En kısa sürede sizinle iletişime geçeceğiz.</p>
                            <p className="text-muted">Başvuru No: {applicationNo}</p>
                            <button className="btn btn-primary" onClick={onClose}>Tamam</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Şirket Adı *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Yetkili Kişi *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>E-posta *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Telefon *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Talep Edilen Tutar (€) *</label>
                                    <input
                                        type="number"
                                        required
                                        min={product.minAmount}
                                        max={product.maxAmount}
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Kullanım Amacı *</label>
                                    <select
                                        required
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    >
                                        <option value="">Seçin...</option>
                                        {product.suitableFor.map((s, i) => (
                                            <option key={i} value={s}>{s}</option>
                                        ))}
                                        <option value="other">Diğer</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Ek Notlar</label>
                                <textarea
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Proje detayları, beklentileriniz..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
                            <button type="submit" className="btn btn-primary">📤 Başvuruyu Gönder</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default GreenCredit
