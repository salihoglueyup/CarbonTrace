import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { companiesAPI } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        company_id: ''
    })
    const [companies, setCompanies] = useState([])
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const { register } = useAuth()
    const navigate = useNavigate()
    const { t, language } = useLanguage()

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const data = await companiesAPI.getAll()
                setCompanies(data)
            } catch (err) {
                console.error('Failed to fetch companies:', err)
            }
        }
        fetchCompanies()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Error message translation
    const getErrorMessage = (type) => {
        const messages = {
            passwordMismatch: language === 'tr' ? 'Şifreler eşleşmiyor' : 'Passwords do not match',
            passwordLength: language === 'tr' ? 'Şifre en az 6 karakter olmalıdır' : 'Password must be at least 6 characters',
            acceptTerms: language === 'tr' ? 'Kullanım koşullarını kabul etmelisiniz' : 'You must accept the terms of use'
        }
        return messages[type] || type
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError(getErrorMessage('passwordMismatch'))
            return
        }

        if (formData.password.length < 6) {
            setError(getErrorMessage('passwordLength'))
            return
        }

        if (!acceptTerms) {
            setError(getErrorMessage('acceptTerms'))
            return
        }

        setIsSubmitting(true)

        const result = await register({
            full_name: formData.full_name,
            email: formData.email,
            password: formData.password,
            company_id: formData.company_id ? parseInt(formData.company_id) : null
        })

        if (result.success) {
            navigate('/')
        } else {
            setError(result.error)
        }

        setIsSubmitting(false)
    }

    return (
        <div className="auth-container gradient-animated">
            <div className="auth-card card-glass">
                <div className="auth-header">
                    <div className="auth-logo">
                        <img src="/src/assets/logo.svg" alt="CarbonTrace Logo" className="h-16 w-16" />
                    </div>
                    <h1>CarbonTrace</h1>
                    <p>Garanti BBVA</p>
                </div>

                <div className="auth-body">
                    <h2>{t('auth.register')}</h2>
                    <p className="auth-subtitle">
                        {language === 'tr' ? 'Yeni hesap oluşturun' : 'Create a new account'}
                    </p>

                    {error && (
                        <div className="alert alert-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="full_name">{t('auth.fullName')}</label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder={language === 'tr' ? 'Ahmet Yılmaz' : 'John Doe'}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">{t('auth.email')}</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={language === 'tr' ? 'ornek@sirket.com' : 'example@company.com'}
                                required
                            />
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label htmlFor="password">{t('auth.password')}</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="company_id">
                                {language === 'tr' ? 'Şirket (Opsiyonel)' : 'Company (Optional)'}
                            </label>
                            <select
                                id="company_id"
                                name="company_id"
                                value={formData.company_id}
                                onChange={handleChange}
                            >
                                <option value="">
                                    {language === 'tr' ? 'Şirket seçin...' : 'Select company...'}
                                </option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                            />
                            <span>
                                <a href="/terms" className="link" target="_blank">
                                    {language === 'tr' ? 'Kullanım Koşulları' : 'Terms of Use'}
                                </a>
                                {language === 'tr' ? "'nı kabul ediyorum" : ' - I accept'}
                            </span>
                        </label>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? (language === 'tr' ? 'Kayıt yapılıyor...' : 'Registering...')
                                : t('auth.register')
                            }
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            {t('auth.hasAccount')}{' '}
                            <Link to="/login" className="link">
                                {t('auth.login')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <div className="auth-info">
                <h2>🌿 {language === 'tr' ? 'Neden CarbonTrace?' : 'Why CarbonTrace?'}</h2>
                <p>
                    {language === 'tr'
                        ? "Avrupa Birliği'nin Karbon Sınır Düzenleme Mekanizması (CBAM) için hazır olun. Ücretsiz hesap oluşturun ve avantajlardan yararlanın."
                        : "Get ready for the EU's Carbon Border Adjustment Mechanism (CBAM). Create a free account and enjoy the benefits."
                    }
                </p>
                <ul>
                    <li>✓ {language === 'tr' ? 'Ücretsiz temel özellikler' : 'Free basic features'}</li>
                    <li>✓ {language === 'tr' ? 'Anlık emisyon takibi' : 'Real-time emission tracking'}</li>
                    <li>✓ {language === 'tr' ? 'CBAM maliyet hesaplayıcı' : 'CBAM cost calculator'}</li>
                    <li>✓ {language === 'tr' ? 'Yeşil finansman danışmanlığı' : 'Green finance consulting'}</li>
                </ul>
            </div>
        </div>
    )
}

export default Register
