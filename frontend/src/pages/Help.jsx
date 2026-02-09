import { useState, useMemo } from 'react'
import { Accordion } from '../components/InteractiveUI'
import { SearchAutocomplete } from '../components/InteractiveUI'
import { useLanguage } from '../contexts/LanguageContext'

const Help = () => {
    const { language } = useLanguage()
    const [activeCategory, setActiveCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // SSS Kategorileri ve Soruları - useMemo ile stable referans
    const faqCategories = useMemo(() => language === 'tr' ? [
        { id: 'general', name: 'Genel', icon: '📋', color: '#004481' },
        { id: 'cbam', name: 'CBAM', icon: '🌍', color: '#1973B8' },
        { id: 'emissions', name: 'Emisyon', icon: '🌿', color: '#2E8B57' },
        { id: 'payment', name: 'Ödeme & Finans', icon: '💳', color: '#FF6B35' },
        { id: 'technical', name: 'Teknik', icon: '⚙️', color: '#9B59B6' }
    ] : [
        { id: 'general', name: 'General', icon: '📋', color: '#004481' },
        { id: 'cbam', name: 'CBAM', icon: '🌍', color: '#1973B8' },
        { id: 'emissions', name: 'Emissions', icon: '🌿', color: '#2E8B57' },
        { id: 'payment', name: 'Payment & Finance', icon: '💳', color: '#FF6B35' },
        { id: 'technical', name: 'Technical', icon: '⚙️', color: '#9B59B6' }
    ], [language])

    const faqItems = useMemo(() => [
        // Genel
        {
            id: 1,
            category: 'general',
            title: 'CBAM Guard nedir?',
            content: `CBAM Guard, Avrupa Birliği'nin Karbon Sınır Düzenleme Mekanizması (Carbon Border Adjustment Mechanism) kapsamındaki yükümlülüklerinizi yönetmenize yardımcı olan kapsamlı bir platformdur.

Platform özellikleri:
• Emisyon takibi ve raporlama
• CBAM maliyet hesaplama
• Tedarikçi yönetimi
• AI destekli öngörüler
• Yeşil kredi fırsatları`
        },
        {
            id: 2,
            category: 'general',
            title: 'Hesap nasıl oluşturabilirim?',
            content: `Hesap oluşturmak için:
1. Ana sayfada "Kayıt Ol" butonuna tıklayın
2. Şirket bilgilerinizi girin
3. E-posta adresinizi doğrulayın
4. Profil bilgilerinizi tamamlayın

Not: Kurumsal hesaplar için yönetici onayı gerekebilir.`
        },
        {
            id: 3,
            category: 'general',
            title: 'Hangi sektörler CBAM kapsamında?',
            content: `CBAM kapsamındaki sektörler:
• Demir ve Çelik
• Alüminyum
• Çimento
• Gübre
• Elektrik
• Hidrojen

2026'dan itibaren kapsam genişleyebilir.`
        },

        // CBAM
        {
            id: 4,
            category: 'cbam',
            title: 'CBAM nedir ve nasıl çalışır?',
            content: `CBAM (Carbon Border Adjustment Mechanism), AB'nin karbon kaçağını önlemek için uyguladığı bir mekanizmadır.

Nasıl çalışır:
1. İthalatçılar, ürünlerin gömülü karbon emisyonlarını beyan eder
2. AB ETS fiyatına göre CBAM sertifikası satın alınır
3. Üretim ülkesinde ödenen karbon vergisi düşülebilir

Geçiş dönemi: 2023-2025 (sadece raporlama)
Tam uygulama: 2026'dan itibaren`
        },
        {
            id: 5,
            category: 'cbam',
            title: 'CBAM raporları ne sıklıkla gönderilmeli?',
            content: `Raporlama dönemleri:

Geçiş Dönemi (2023-2025):
• Çeyreklik raporlar
• Her çeyreğin sonundan 1 ay içinde

Tam Uygulama (2026+):
• Yıllık beyanname
• Her yılın 31 Mayıs'ına kadar

CBAM Guard, tüm süreleri otomatik takip eder ve hatırlatmalar gönderir.`
        },
        {
            id: 6,
            category: 'cbam',
            title: 'CBAM maliyeti nasıl hesaplanır?',
            content: `CBAM maliyeti şu formülle hesaplanır:

Maliyet = Gömülü Emisyon × CBAM Sertifika Fiyatı - Üçüncü Ülke Karbon Vergisi

Örnek:
• İthalat: 100 ton çelik
• Gömülü emisyon: 2 ton CO2/ton çelik = 200 ton CO2
• CBAM fiyatı: €80/ton
• Maliyet: 200 × 80 = €16,000

CBAM Hesaplayıcı aracımız bu hesaplamayı otomatik yapar.`
        },

        // Emisyon
        {
            id: 7,
            category: 'emissions',
            title: 'Emisyon verilerini nasıl girebilirim?',
            content: `Emisyon verisi giriş yöntemleri:

1. Manuel Giriş
   • Emisyon Analizi > Yeni Kayıt
   • Şirket, ürün ve miktar bilgilerini girin

2. Toplu Yükleme
   • Excel şablonu indirin
   • Verileri doldurun
   • Sisteme yükleyin

3. API Entegrasyonu
   • Teknik dokümantasyona bakın
   • ERP sistemlerinizle entegre edin`
        },
        {
            id: 8,
            category: 'emissions',
            title: 'Doğrudan ve dolaylı emisyon farkı nedir?',
            content: `Emisyon Tipleri:

Scope 1 (Doğrudan):
• Şirketin sahip olduğu kaynaklardan
• Örn: Fabrika bacaları, şirket araçları

Scope 2 (Enerji Dolaylı):
• Satın alınan enerji
• Örn: Elektrik, ısıtma, soğutma

Scope 3 (Diğer Dolaylı):
• Değer zinciri boyunca
• Örn: Tedarikçiler, lojistik, son kullanım

CBAM genellikle Scope 1 ve 2'yi kapsar.`
        },

        // Ödeme & Finans
        {
            id: 9,
            category: 'payment',
            title: 'Yeşil Kredi nedir?',
            content: `Yeşil Kredi, çevre dostu projeleri finanse etmek için verilen özel kredilerdir.

Avantajları:
• Düşük faiz oranları
• Uzun vadeli ödeme
• Vergi avantajları
• Sürdürülebilirlik puanı artışı

CBAM Guard üzerinden Garanti BBVA yeşil kredi ürünlerine başvurabilirsiniz.`
        },
        {
            id: 10,
            category: 'payment',
            title: 'CBAM sertifikaları nasıl satın alınır?',
            content: `CBAM Sertifika Satın Alma:

1. AB üye devleti yetkili otoritesine kayıt
2. CBAM beyannamesi hazırlama
3. Sertifika ihtiyacı hesaplama
4. Sertifika satın alma (haftalık açık artırma)
5. Yıllık teslim

Fiyatlar AB ETS fiyatına bağlıdır ve haftalık güncellenir.`
        },

        // Teknik
        {
            id: 11,
            category: 'technical',
            title: 'API entegrasyonu nasıl yapılır?',
            content: `API Entegrasyon Adımları:

1. API anahtarı oluşturun (Ayarlar > API Anahtarları)
2. Dokümantasyonu inceleyin
3. Test ortamında deneyin
4. Canlı ortama geçin

Desteklenen işlemler:
• GET /api/companies - Şirket listesi
• POST /api/emissions - Emisyon kaydı
• GET /api/reports - Rapor oluşturma

Detaylı dokümantasyon için Settings > API bölümüne bakın.`
        },
        {
            id: 12,
            category: 'technical',
            title: 'Veri güvenliği nasıl sağlanıyor?',
            content: `Güvenlik Önlemleri:

🔐 Şifreleme
• TLS 1.3 ile uçtan uca şifreleme
• Veritabanı şifreleme (AES-256)

🔑 Kimlik Doğrulama
• İki faktörlü doğrulama (2FA)
• JWT token tabanlı oturum

📊 Denetim
• Tüm işlemler loglanır
• Düzenli güvenlik denetimleri

🏛️ Uyumluluk
• GDPR uyumlu
• ISO 27001 sertifikalı`
        },
        {
            id: 13,
            category: 'technical',
            title: 'Mobil uygulama var mı?',
            content: `CBAM Guard PWA olarak çalışır:

Kurulum:
1. Tarayıcınızda cbamguard.com'u açın
2. "Ana Ekrana Ekle" seçeneğini tıklayın
3. Uygulama gibi kullanın

Özellikler:
• Çevrimdışı erişim
• Push bildirimler
• Hızlı yükleme
• Otomatik güncelleme

iOS ve Android için native uygulama yakında!`
        }
    ], [])

    // Arama için tüm sorular
    const searchItems = faqItems.map(item => ({
        id: item.id,
        label: item.title,
        category: faqCategories.find(c => c.id === item.category)?.name || ''
    }))

    // Filtrelenmiş sorular
    const filteredFaqs = useMemo(() => {
        let items = faqItems

        // Kategori filtresi
        if (activeCategory !== 'all') {
            items = items.filter(item => item.category === activeCategory)
        }

        // Arama filtresi
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            items = items.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.content.toLowerCase().includes(query)
            )
        }

        return items
    }, [activeCategory, searchQuery, faqItems])

    // Accordion items formatı
    const accordionItems = filteredFaqs.map(item => ({
        id: item.id.toString(),
        title: item.title,
        content: (
            <div className="faq-content">
                {item.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                ))}
            </div>
        )
    }))

    // İletişim kanalları
    const contactChannels = [
        { icon: '📧', label: 'E-posta', value: 'destek@cbamguard.com', action: 'mailto:destek@cbamguard.com' },
        { icon: '📞', label: 'Telefon', value: '0850 123 45 67', action: 'tel:08501234567' },
        { icon: '💬', label: 'Canlı Destek', value: 'Chat başlat', action: '/chat' },
        { icon: '📚', label: 'Dokümantasyon', value: 'API Docs', action: '/settings' }
    ]

    return (
        <div className="help-page">
            {/* Hero Section */}
            <div className="help-hero">
                <div className="help-hero-content">
                    <h1>🆘 Yardım Merkezi</h1>
                    <p>Sorularınıza cevap bulun veya bizimle iletişime geçin</p>

                    {/* Arama */}
                    <div className="help-search">
                        <SearchAutocomplete
                            items={searchItems}
                            placeholder="Soru ara... (örn: CBAM nedir)"
                            onSelect={(item) => {
                                setSearchQuery(item.label)
                                setActiveCategory('all')
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* İstatistikler */}
            <div className="help-stats">
                <div className="help-stat">
                    <span className="stat-number">{faqItems.length}</span>
                    <span className="stat-label">SSS</span>
                </div>
                <div className="help-stat">
                    <span className="stat-number">{faqCategories.length}</span>
                    <span className="stat-label">Kategori</span>
                </div>
                <div className="help-stat">
                    <span className="stat-number">7/24</span>
                    <span className="stat-label">Destek</span>
                </div>
                <div className="help-stat">
                    <span className="stat-number">&lt;2s</span>
                    <span className="stat-label">Yanıt</span>
                </div>
            </div>

            {/* Ana İçerik */}
            <div className="help-content">
                {/* Kategori Sidebar */}
                <div className="help-sidebar">
                    <h3>Kategoriler</h3>
                    <div className="category-list">
                        <button
                            className={`category-item ${activeCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveCategory('all')}
                        >
                            <span className="category-icon">📁</span>
                            <span>Tümü</span>
                            <span className="category-count">{faqItems.length}</span>
                        </button>
                        {faqCategories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-item ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{ '--cat-color': cat.color }}
                            >
                                <span className="category-icon">{cat.icon}</span>
                                <span>{cat.name}</span>
                                <span className="category-count">
                                    {faqItems.filter(i => i.category === cat.id).length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* SSS Listesi */}
                <div className="help-main">
                    <div className="faq-header">
                        <h2>
                            {activeCategory === 'all'
                                ? 'Sık Sorulan Sorular'
                                : faqCategories.find(c => c.id === activeCategory)?.name + ' SSS'}
                        </h2>
                        <span className="faq-count">{filteredFaqs.length} soru</span>
                    </div>

                    {filteredFaqs.length > 0 ? (
                        <Accordion items={accordionItems} allowMultiple />
                    ) : (
                        <div className="empty-state-card">
                            <span className="empty-icon">🔍</span>
                            <h3>Sonuç bulunamadı</h3>
                            <p>Farklı anahtar kelimeler deneyin veya tüm kategorilere bakın</p>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    setSearchQuery('')
                                    setActiveCategory('all')
                                }}
                            >
                                Tümünü Göster
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* İletişim Kanalları */}
            <div className="help-contact">
                <h2>Hala Yardıma mı İhtiyacınız Var?</h2>
                <p>Uzman ekibimiz size yardımcı olmaktan mutluluk duyar</p>

                <div className="contact-grid">
                    {contactChannels.map((channel, index) => (
                        <a
                            key={index}
                            href={channel.action}
                            className="contact-card"
                        >
                            <span className="contact-icon">{channel.icon}</span>
                            <span className="contact-label">{channel.label}</span>
                            <span className="contact-value">{channel.value}</span>
                        </a>
                    ))}
                </div>
            </div>

            {/* Quick Tips */}
            <div className="help-tips">
                <h3>💡 Hızlı İpuçları</h3>
                <div className="tips-grid">
                    <div className="tip-card">
                        <span className="tip-key">Ctrl + K</span>
                        <span>Hızlı arama</span>
                    </div>
                    <div className="tip-card">
                        <span className="tip-key">?</span>
                        <span>Klavye kısayolları</span>
                    </div>
                    <div className="tip-card">
                        <span className="tip-key">Esc</span>
                        <span>Modalı kapat</span>
                    </div>
                    <div className="tip-card">
                        <span className="tip-key">Tab</span>
                        <span>Sonraki alan</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Help
