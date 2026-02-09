import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth()
    const location = useLocation()

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Yükleniyor...</p>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check role requirements
    if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
        return (
            <div className="access-denied">
                <h2>⛔ Erişim Engellendi</h2>
                <p>Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
            </div>
        )
    }

    return children
}

export default ProtectedRoute
