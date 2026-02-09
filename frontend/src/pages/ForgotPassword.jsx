import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const { forgotPassword } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        const result = await forgotPassword(email)

        if (result.success) {
            setSuccess(true)
        } else {
            setError(result.error)
        }

        setIsSubmitting(false)
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <img src="/src/assets/logo.svg" alt="CarbonTrace Logo" className="h-16 w-16" />
                    </div>
                    <h1>CarbonTrace</h1>
                    <p>Garanti BBVA</p>
                </div>

                <div className="auth-body">
                    <h2>Şifremi Unuttum</h2>
                    <p className="auth-subtitle">
                        E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim
                    </p>

                    {success ? (
                        <div className="success-message">
                            <div className="success-icon">✉️</div>
                            <h3>E-posta Gönderildi!</h3>
                            <p>
                                Eğer bu e-posta adresine kayıtlı bir hesap varsa,
                                şifre sıfırlama bağlantısı gönderildi.
                            </p>
                            <p className="text-muted">
                                Spam klasörünüzü kontrol etmeyi unutmayın.
                            </p>
                            <Link to="/login" className="btn btn-primary btn-block">
                                Giriş Sayfasına Dön
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="alert alert-error">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="email">E-posta</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ornek@sirket.com"
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                                </button>
                            </form>

                            <div className="auth-footer">
                                <p>
                                    Şifrenizi hatırladınız mı?{' '}
                                    <Link to="/login" className="link">
                                        Giriş Yap
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="auth-info">
                <h2>🔐 Hesap Güvenliği</h2>
                <p>
                    Şifrenizi sıfırlamak için kayıtlı e-posta adresinize
                    bir bağlantı göndereceğiz. Bu bağlantı 1 saat geçerlidir.
                </p>
                <ul>
                    <li>✓ Güvenli şifre sıfırlama</li>
                    <li>✓ Tek kullanımlık bağlantı</li>
                    <li>✓ 1 saat geçerlilik</li>
                </ul>
            </div>
        </div>
    )
}

export default ForgotPassword
