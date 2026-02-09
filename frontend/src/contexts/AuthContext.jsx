import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Check if user is already logged in on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token')
            const savedUser = localStorage.getItem('user')

            if (token && savedUser) {
                try {
                    // Verify token is still valid
                    const currentUser = await authAPI.getCurrentUser()
                    setUser(currentUser)
                } catch (err) {
                    // Token invalid, clear storage
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    localStorage.removeItem('user')
                }
            }
            setLoading(false)
        }

        initAuth()
    }, [])

    const login = useCallback(async (email, password) => {
        setError(null)
        setLoading(true)

        try {
            const response = await authAPI.login(email, password)

            localStorage.setItem('access_token', response.access_token)
            localStorage.setItem('refresh_token', response.refresh_token)
            localStorage.setItem('user', JSON.stringify(response.user))

            setUser(response.user)
            setLoading(false)
            return { success: true }
        } catch (err) {
            const message = err.response?.data?.detail || 'Giriş başarısız'
            setError(message)
            setLoading(false)
            return { success: false, error: message }
        }
    }, [])

    const register = useCallback(async (userData) => {
        setError(null)
        setLoading(true)

        try {
            const response = await authAPI.register(userData)

            localStorage.setItem('access_token', response.access_token)
            localStorage.setItem('refresh_token', response.refresh_token)
            localStorage.setItem('user', JSON.stringify(response.user))

            setUser(response.user)
            setLoading(false)
            return { success: true }
        } catch (err) {
            const message = err.response?.data?.detail || 'Kayıt başarısız'
            setError(message)
            setLoading(false)
            return { success: false, error: message }
        }
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        localStorage.removeItem('is_guest')
        setUser(null)
    }, [])

    // Guest login - no authentication required
    const loginAsGuest = useCallback(() => {
        const guestUser = {
            id: 'guest',
            email: 'guest@cbamguard.com',
            name: 'Misafir Kullanıcı',
            role: 'guest',
            is_guest: true
        }
        localStorage.setItem('is_guest', 'true')
        localStorage.setItem('user', JSON.stringify(guestUser))
        setUser(guestUser)
        return { success: true }
    }, [])

    const forgotPassword = useCallback(async (email) => {
        setError(null)

        try {
            const response = await authAPI.forgotPassword(email)
            return { success: true, message: response.message }
        } catch (err) {
            const message = err.response?.data?.detail || 'İşlem başarısız'
            return { success: false, error: message }
        }
    }, [])

    const resetPassword = useCallback(async (token, newPassword) => {
        setError(null)

        try {
            const response = await authAPI.resetPassword(token, newPassword)
            return { success: true, message: response.message }
        } catch (err) {
            const message = err.response?.data?.detail || 'Şifre sıfırlama başarısız'
            return { success: false, error: message }
        }
    }, [])

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isGuest: user?.is_guest || false,
        login,
        loginAsGuest,
        register,
        logout,
        forgotPassword,
        resetPassword,
        clearError: () => setError(null)
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
