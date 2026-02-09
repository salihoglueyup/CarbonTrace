import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ToastProvider } from './contexts/ToastContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import CommandPalette from './components/CommandPalette'
import GlobalSearch from './components/GlobalSearch'
import BottomNavigation from './components/BottomNavigation'
import Onboarding from './components/Onboarding'

// Public pages - imported directly for fast initial load
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

// Protected pages - lazy loaded for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Chat = lazy(() => import('./pages/Chat'))
const Companies = lazy(() => import('./pages/Companies'))
const EmissionDetail = lazy(() => import('./pages/EmissionDetail'))
const CBAMCalculator = lazy(() => import('./pages/CBAMCalculator'))
const GreenCredit = lazy(() => import('./pages/GreenCredit'))
const Reports = lazy(() => import('./pages/Reports'))
const Projects = lazy(() => import('./pages/Projects'))
const Settings = lazy(() => import('./pages/Settings'))
const Hedging = lazy(() => import('./pages/Hedging'))
const Documents = lazy(() => import('./pages/Documents'))
const CompanyComparison = lazy(() => import('./pages/CompanyComparison'))
const Suppliers = lazy(() => import('./pages/Suppliers'))
const Compliance = lazy(() => import('./pages/Compliance'))
const Admin = lazy(() => import('./pages/Admin'))
const ScenarioPlanning = lazy(() => import('./pages/ScenarioPlanning'))
const Calendar = lazy(() => import('./pages/Calendar'))
const DataVisualization = lazy(() => import('./pages/DataVisualization'))
const TeamActivity = lazy(() => import('./pages/TeamActivity'))
const AIInsights = lazy(() => import('./pages/AIInsights'))
const PerformanceMonitor = lazy(() => import('./pages/PerformanceMonitor'))
const Help = lazy(() => import('./pages/Help'))
const AuditLog = lazy(() => import('./pages/AuditLog'))
const Finance = lazy(() => import('./pages/Finance'))

// Supplier Portal - lazy loaded
const PortalLayout = lazy(() => import('./components/PortalLayout'))
const PortalLogin = lazy(() => import('./pages/PortalLogin'))
const PortalForm = lazy(() => import('./pages/PortalForm'))

// CSS zaten main.jsx'te import ediliyor - çift import kaldırıldı

// Page Loading Fallback Component
const PageLoader = () => (
  <div className="page-loader">
    <div className="spinner"></div>
    <p>Sayfa yükleniyor...</p>
  </div>
)

// Register service worker for PWA - ONLY in production!
const IS_PRODUCTION = import.meta.env.PROD
if (IS_PRODUCTION && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { })
  })
} else if ('serviceWorker' in navigator) {
  // Development: Clear all caches and unregister SW
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      console.log('[DEV] Unregistering service worker')
      registration.unregister()
    })
  })
  caches.keys().then(names => {
    names.forEach(name => {
      console.log('[DEV] Deleting cache:', name)
      caches.delete(name)
    })
  })
}

// Public routes that should not show authenticated UI
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/portal/login', '/portal/form']

// App Content - inside Router context
function AppRoutes() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { toggleTheme } = useTheme()
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname)

  // Show onboarding as computed value based on auth state
  const shouldShowOnboarding = isAuthenticated &&
    !isPublicRoute &&
    !localStorage.getItem('onboarding_completed') &&
    !showOnboarding // Track if user explicitly dismissed

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true')
    setShowOnboarding(true) // Mark as dismissed
  }

  // Keyboard shortcuts - only for authenticated users
  useEffect(() => {
    if (!isAuthenticated) return

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }

      const ctrlKey = e.ctrlKey || e.metaKey

      if (ctrlKey && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
        return
      }

      if (ctrlKey && e.key === '/') {
        e.preventDefault()
        setSearchOpen(true)
        return
      }

      if (e.shiftKey && e.key === 'T') {
        toggleTheme?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleTheme, isAuthenticated])

  // Don't render anything while checking auth
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    )
  }

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Supplier Portal Routes */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route path="login" element={<PortalLogin />} />
            <Route path="form" element={<PortalForm />} />
          </Route>

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute><Layout><Companies /></Layout></ProtectedRoute>} />
          <Route path="/emissions" element={<ProtectedRoute><Layout><EmissionDetail /></Layout></ProtectedRoute>} />
          <Route path="/emissions/:companyId" element={<ProtectedRoute><Layout><EmissionDetail /></Layout></ProtectedRoute>} />
          <Route path="/cbam" element={<ProtectedRoute><Layout><CBAMCalculator /></Layout></ProtectedRoute>} />
          <Route path="/green-credit" element={<ProtectedRoute><Layout><GreenCredit /></Layout></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Layout><Projects /></Layout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
          <Route path="/hedging" element={<ProtectedRoute><Layout><Hedging /></Layout></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Layout><Documents /></Layout></ProtectedRoute>} />
          <Route path="/comparison" element={<ProtectedRoute><Layout><CompanyComparison /></Layout></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><Layout><Suppliers /></Layout></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><Layout><Compliance /></Layout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Layout><Admin /></Layout></ProtectedRoute>} />
          <Route path="/scenarios" element={<ProtectedRoute><Layout><ScenarioPlanning /></Layout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Layout><Calendar /></Layout></ProtectedRoute>} />
          <Route path="/visualization" element={<ProtectedRoute><Layout><DataVisualization /></Layout></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><Layout><TeamActivity /></Layout></ProtectedRoute>} />
          <Route path="/ai-insights" element={<ProtectedRoute><Layout><AIInsights /></Layout></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><Layout><PerformanceMonitor /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><Layout><Help /></Layout></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute><Layout><AuditLog /></Layout></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><Layout><Finance /></Layout></ProtectedRoute>} />
        </Routes>
      </Suspense>

      {/* Mobile Bottom Navigation - only for authenticated users on non-public routes */}
      {isAuthenticated && !isPublicRoute && <BottomNavigation />}

      {/* Global Modals - only for authenticated users */}
      {isAuthenticated && (
        <>
          <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
          <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
      )}

      {/* Onboarding - only for authenticated users on non-public routes */}
      {shouldShowOnboarding && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          onNavigate={(path) => navigate(path)}
        />
      )}
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <FavoritesProvider>
            <AuthProvider>
              <WebSocketProvider>
                <NotificationProvider>
                  <Router>
                    <AppRoutes />
                  </Router>
                </NotificationProvider>
              </WebSocketProvider>
            </AuthProvider>
          </FavoritesProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
