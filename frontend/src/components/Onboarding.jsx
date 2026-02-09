import { useState } from 'react'

const Onboarding = ({ onComplete, onNavigate }) => {
    const [currentStep, setCurrentStep] = useState(0)

    const completeOnboarding = () => {
        localStorage.setItem('onboarding_completed', 'true')
        onComplete?.()
    }

    const steps = [
        {
            title: "CarbonTrace'e Hoş Geldiniz! 🎉",
            description: "AB Karbon Sınır Düzenleme Mekanizması için tek platform.",
            content: (
                <div className="onboarding-welcome">
                    <div className="welcome-icon">🛡️</div>
                    <h2>CBAM Uyumluluğunuzu Kolaylaştırın</h2>
                    <p>Bu kısa tur ile platformun temel özelliklerini keşfedin.</p>
                </div>
            )
        },
        {
            title: "Dashboard 📊",
            description: "Tüm verilerinizi tek bakışta görün",
            content: (
                <div className="onboarding-feature">
                    <div className="feature-preview dashboard-preview">
                        <div className="mock-card">Toplam Emisyon</div>
                        <div className="mock-card">CBAM Maliyet</div>
                        <div className="mock-card">Risk Skoru</div>
                    </div>
                    <ul className="feature-list">
                        <li>🌿 Anlık emisyon takibi</li>
                        <li>💰 CBAM maliyet hesaplama</li>
                        <li>📈 Trend analizi</li>
                    </ul>
                </div>
            )
        },
        {
            title: "AI Asistan 🤖",
            description: "CBAM hakkında sorularınızı sorun",
            content: (
                <div className="onboarding-feature">
                    <div className="feature-preview chat-preview">
                        <div className="mock-message user">CBAM nedir?</div>
                        <div className="mock-message ai">CBAM, AB'nin karbon sınır düzenleme mekanizmasıdır...</div>
                    </div>
                    <ul className="feature-list">
                        <li>💬 Doğal dil ile soru-cevap</li>
                        <li>📚 CBAM dokümantasyonu</li>
                        <li>🎯 Kişiselleştirilmiş öneriler</li>
                    </ul>
                </div>
            )
        },
        {
            title: "Klavye Kısayolları ⌨️",
            description: "Hızlı navigasyon için kısayolları öğrenin",
            content: (
                <div className="onboarding-shortcuts">
                    <div className="shortcut-grid">
                        <div className="shortcut-item">
                            <kbd>Ctrl</kbd>+<kbd>K</kbd>
                            <span>Command Palette</span>
                        </div>
                        <div className="shortcut-item">
                            <kbd>Ctrl</kbd>+<kbd>/</kbd>
                            <span>Arama</span>
                        </div>
                        <div className="shortcut-item">
                            <kbd>Shift</kbd>+<kbd>T</kbd>
                            <span>Tema Değiştir</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Hazırsınız! 🚀",
            description: "Platformu keşfetmeye başlayın",
            content: (
                <div className="onboarding-complete">
                    <div className="complete-icon">✨</div>
                    <h2>Tebrikler!</h2>
                    <p>Artık CBAM Guard'ı kullanmaya hazırsınız.</p>
                    <div className="quick-actions">
                        <button className="quick-action" onClick={() => { completeOnboarding(); onNavigate?.('/'); }}>
                            📊 Dashboard'a Git
                        </button>
                        <button className="quick-action" onClick={() => { completeOnboarding(); onNavigate?.('/chat'); }}>
                            🤖 AI Asistan
                        </button>
                        <button className="quick-action" onClick={() => { completeOnboarding(); onNavigate?.('/compliance'); }}>
                            ✅ Uyumluluk
                        </button>
                    </div>
                </div>
            )
        }
    ]

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            completeOnboarding()
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const skipOnboarding = () => {
        completeOnboarding()
    }



    return (
        <div className="onboarding-overlay">
            <div className="onboarding-modal">
                {/* Progress */}
                <div className="onboarding-progress">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`progress-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="onboarding-content">
                    <h1>{steps[currentStep].title}</h1>
                    <p className="step-description">{steps[currentStep].description}</p>
                    {steps[currentStep].content}
                </div>

                {/* Navigation */}
                <div className="onboarding-nav">
                    <button
                        className="btn btn-ghost"
                        onClick={skipOnboarding}
                    >
                        Atla
                    </button>
                    <div className="nav-buttons">
                        {currentStep > 0 && (
                            <button className="btn btn-secondary" onClick={prevStep}>
                                ← Geri
                            </button>
                        )}
                        <button className="btn btn-primary" onClick={nextStep}>
                            {currentStep === steps.length - 1 ? 'Bitir' : 'İleri →'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Onboarding
