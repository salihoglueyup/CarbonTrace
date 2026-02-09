import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const { login, loginAsGuest } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const { t, language } = useLanguage()

    const from = location.state?.from?.pathname || '/'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        const result = await login(email, password)

        if (result.success) {
            navigate(from, { replace: true })
        } else {
            setError(result.error)
        }

        setIsSubmitting(false)
    }

    const handleGuestLogin = () => {
        if (loginAsGuest) {
            loginAsGuest()
        }
        navigate('/', { replace: true })
    }

    // Error message translation
    const getErrorMessage = (err) => {
        if (err === 'Invalid credentials') {
            return language === 'tr'
                ? 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.'
                : 'Invalid email or password. Please try again.'
        }
        return err
    }

    return (
        <div className="eco-login-container">
            {/* Dynamic Background */}
            <div className="eco-bg-mesh"></div>

            {/* Floating Particles */}
            <div className="eco-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
            </div>

            {/* Glassmorphism Card */}
            <div className="eco-glass-card animate-in delay-100">
                <div className="eco-brand">
                    <div className="eco-logo">
                        <img src="/src/assets/logo.svg" alt="CarbonTrace Logo" className="h-16 w-16" />
                    </div>
                    <h1 className="eco-title">CarbonTrace</h1>
                    <p className="eco-subtitle">
                        {language === 'tr' ? 'Sürdürülebilir Geleceğin İzi' : 'Tracing Sustainable Future'}
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error shake animate-in" style={{ marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
                        <span className="alert-icon">⚠️</span>
                        <div className="alert-content">
                            <strong>{t('common.error')}</strong>
                            <p>{getErrorMessage(error)}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="eco-input-group animate-in delay-200">
                        <label htmlFor="email" className="eco-label">{t('auth.email')}</label>
                        <div className="eco-input-wrapper">
                            <input
                                className="eco-input"
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={language === 'tr' ? 'ornek@sirket.com' : 'example@company.com'}
                                required
                                autoComplete="email"
                            />
                            <span className="eco-input-icon">📧</span>
                        </div>
                    </div>

                    <div className="eco-input-group animate-in delay-200">
                        <label htmlFor="password" className="eco-label">{t('auth.password')}</label>
                        <div className="eco-input-wrapper">
                            <input
                                className="eco-input"
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                            <span className="eco-input-icon">🔐</span>
                        </div>
                    </div>

                    <div className="eco-actions animate-in delay-200">
                        <label className="eco-checkbox">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>{t('auth.rememberMe')}</span>
                        </label>
                        <Link to="/forgot-password" className="eco-link">
                            {t('auth.forgotPassword')}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="eco-btn-primary animate-in delay-300"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin" style={{ marginRight: '8px' }}>↻</span>
                                {language === 'tr' ? 'Giriş Yapılıyor...' : 'Signing in...'}
                            </>
                        ) : (
                            t('auth.login')
                        )}
                    </button>
                </form>

                <button
                    type="button"
                    className="eco-btn-guest animate-in delay-300"
                    onClick={handleGuestLogin}
                >
                    <span>👤</span>
                    {language === 'tr' ? 'Misafir Girişi' : 'Guest Login'}
                </button>

                <div className="eco-footer animate-in delay-300">
                    <p>
                        {t('auth.noAccount')}{' '}
                        <Link to="/register" className="eco-link">
                            {t('auth.register')}
                        </Link>
                    </p>
                    <div style={{ marginTop: '1rem', opacity: 0.6, fontSize: '0.75rem' }}>
                        powered by <strong>Garanti BBVA</strong> Technology
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
