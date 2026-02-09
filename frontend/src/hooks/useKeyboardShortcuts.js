import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const useKeyboardShortcuts = ({
    onCommandPalette,
    onSearch,
    onNotifications,
    onThemeToggle
}) => {
    const navigate = useNavigate()

    const handleKeyDown = useCallback((e) => {
        // Ignore if typing in input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            // Allow Escape to blur inputs
            if (e.key === 'Escape') {
                e.target.blur()
            }
            return
        }

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
        const ctrlKey = isMac ? e.metaKey : e.ctrlKey

        // Ctrl+K or Cmd+K - Command Palette
        if (ctrlKey && e.key === 'k') {
            e.preventDefault()
            onCommandPalette?.()
            return
        }

        // Ctrl+/ or Cmd+/ - Search
        if (ctrlKey && e.key === '/') {
            e.preventDefault()
            onSearch?.()
            return
        }

        // Without modifiers
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            switch (e.key) {
                // Navigation shortcuts
                case 'g':
                    // Wait for second key
                    const handleSecondKey = (e2) => {
                        document.removeEventListener('keydown', handleSecondKey)
                        switch (e2.key) {
                            case 'd': navigate('/'); break
                            case 'c': navigate('/chat'); break
                            case 's': navigate('/settings'); break
                            case 'p': navigate('/projects'); break
                            case 'r': navigate('/reports'); break
                            case 'e': navigate('/emissions'); break
                            case 'b': navigate('/cbam'); break
                        }
                    }
                    setTimeout(() => {
                        document.addEventListener('keydown', handleSecondKey, { once: true })
                        setTimeout(() => document.removeEventListener('keydown', handleSecondKey), 1000)
                    }, 0)
                    break

                // Theme toggle
                case 't':
                    if (e.shiftKey) {
                        onThemeToggle?.()
                    }
                    break

                // Notifications
                case 'n':
                    if (e.shiftKey) {
                        onNotifications?.()
                    }
                    break

                // Quick actions with ?
                case '?':
                    if (e.shiftKey) {
                        // Show keyboard shortcuts help (could open a modal)
                        console.log('Keyboard shortcuts help')
                    }
                    break
            }
        }
    }, [navigate, onCommandPalette, onSearch, onNotifications, onThemeToggle])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])
}

// Shortcuts reference
export const KEYBOARD_SHORTCUTS = [
    { keys: ['Ctrl', 'K'], description: 'Command Palette' },
    { keys: ['Ctrl', '/'], description: 'Global Arama' },
    { keys: ['Shift', 'T'], description: 'Tema Değiştir' },
    { keys: ['Shift', 'N'], description: 'Bildirimler' },
    { keys: ['G', 'D'], description: 'Dashboard' },
    { keys: ['G', 'C'], description: 'Chat' },
    { keys: ['G', 'S'], description: 'Ayarlar' },
    { keys: ['G', 'P'], description: 'Projeler' },
    { keys: ['G', 'R'], description: 'Raporlar' },
    { keys: ['G', 'E'], description: 'Emisyonlar' },
    { keys: ['G', 'B'], description: 'CBAM' },
    { keys: ['Shift', '?'], description: 'Kısayollar Yardımı' },
    { keys: ['Esc'], description: 'Kapat / İptal' },
]

export default useKeyboardShortcuts
