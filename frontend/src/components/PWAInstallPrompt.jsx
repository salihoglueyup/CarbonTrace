import { useState, useEffect } from 'react'

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showPrompt, setShowPrompt] = useState(false)
    // Check at init time to avoid effect setState
    const [isInstalled] = useState(() =>
        typeof window !== 'undefined' &&
        window.matchMedia('(display-mode: standalone)').matches
    )

    useEffect(() => {
        if (isInstalled) return

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)

            // Check if user has dismissed before
            const dismissed = localStorage.getItem('pwa-install-dismissed')
            if (!dismissed) {
                setTimeout(() => setShowPrompt(true), 3000) // Show after 3 seconds
            }
        }

        // Listen for appinstalled event
        const handleAppInstalled = () => {
            setShowPrompt(false)
            setDeferredPrompt(null)
            // Reload to update UI
            window.location.reload()
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [isInstalled])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setShowPrompt(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('pwa-install-dismissed', 'true')
    }

    if (isInstalled || !showPrompt) return null

    return (
        <div className="pwa-install-prompt">
            <div className="pwa-install-content">
                <div className="pwa-install-icon">📱</div>
                <div className="pwa-install-text">
                    <h4>CarbonTrace'ı Yükle</h4>
                    <p>Hızlı erişim için uygulamayı ana ekranına ekle</p>
                </div>
                <div className="pwa-install-actions">
                    <button className="pwa-dismiss" onClick={handleDismiss}>
                        Daha sonra
                    </button>
                    <button className="pwa-install" onClick={handleInstall}>
                        Yükle
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================
// OFFLINE INDICATOR
// ============================================
export const OfflineIndicator = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (isOnline) return null

    return (
        <div className="offline-indicator">
            <span className="offline-icon">📡</span>
            <span>Çevrimdışısınız</span>
        </div>
    )
}

// ============================================
// UPDATE AVAILABLE PROMPT
// ============================================
export const UpdatePrompt = () => {
    const [showUpdate, setShowUpdate] = useState(false)
    const [registration, setRegistration] = useState(null)

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                setRegistration(reg)

                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            setShowUpdate(true)
                        }
                    })
                })
            })
        }
    }, [])

    const handleUpdate = () => {
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            window.location.reload()
        }
    }

    if (!showUpdate) return null

    return (
        <div className="update-prompt">
            <div className="update-content">
                <span className="update-icon">🔄</span>
                <span>Yeni sürüm mevcut!</span>
                <button onClick={handleUpdate}>Güncelle</button>
            </div>
        </div>
    )
}

export default PWAInstallPrompt
