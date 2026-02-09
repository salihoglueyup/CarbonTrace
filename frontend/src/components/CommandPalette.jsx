import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const CommandPalette = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef(null)
    const navigate = useNavigate()

    const commands = [
        // Navigation
        { id: 'nav-dashboard', label: 'Dashboard\'a Git', icon: '📊', action: () => navigate('/'), category: 'Navigasyon' },
        { id: 'nav-chat', label: 'AI Asistan', icon: '🤖', action: () => navigate('/chat'), category: 'Navigasyon' },
        { id: 'nav-companies', label: 'Şirketler', icon: '🏢', action: () => navigate('/companies'), category: 'Navigasyon' },
        { id: 'nav-suppliers', label: 'Tedarikçiler', icon: '🏭', action: () => navigate('/suppliers'), category: 'Navigasyon' },
        { id: 'nav-emissions', label: 'Emisyon Analizi', icon: '🌿', action: () => navigate('/emissions'), category: 'Navigasyon' },
        { id: 'nav-cbam', label: 'CBAM Hesaplayıcı', icon: '💰', action: () => navigate('/cbam'), category: 'Navigasyon' },
        { id: 'nav-compliance', label: 'Uyumluluk', icon: '✅', action: () => navigate('/compliance'), category: 'Navigasyon' },
        { id: 'nav-documents', label: 'Dokümanlar', icon: '📎', action: () => navigate('/documents'), category: 'Navigasyon' },
        { id: 'nav-scenarios', label: 'Senaryo Planlama', icon: '🎮', action: () => navigate('/scenarios'), category: 'Navigasyon' },
        { id: 'nav-calendar', label: 'Takvim', icon: '📅', action: () => navigate('/calendar'), category: 'Navigasyon' },
        { id: 'nav-settings', label: 'Ayarlar', icon: '⚙️', action: () => navigate('/settings'), category: 'Navigasyon' },

        // Actions
        { id: 'action-new-company', label: 'Yeni Şirket Ekle', icon: '➕', action: () => navigate('/companies?new=true'), category: 'Eylemler' },
        { id: 'action-upload', label: 'Doküman Yükle', icon: '📤', action: () => navigate('/documents'), category: 'Eylemler' },
        { id: 'action-export-pdf', label: 'PDF Rapor İndir', icon: '📄', action: () => window.open('http://localhost:8000/api/export/pdf/emission'), category: 'Eylemler' },
        { id: 'action-export-excel', label: 'Excel Rapor İndir', icon: '📊', action: () => window.open('http://localhost:8000/api/export/excel/cbam'), category: 'Eylemler' },

        // Theme
        { id: 'theme-dark', label: 'Koyu Mod', icon: '🌙', action: () => { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark') }, category: 'Tema' },
        { id: 'theme-light', label: 'Açık Mod', icon: '☀️', action: () => { document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem('theme', 'light') }, category: 'Tema' },
    ]

    const filteredCommands = query
        ? commands.filter(cmd =>
            cmd.label.toLowerCase().includes(query.toLowerCase()) ||
            cmd.category.toLowerCase().includes(query.toLowerCase())
        )
        : commands

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = []
        acc[cmd.category].push(cmd)
        return acc
    }, {})

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
        setQuery('')
        setSelectedIndex(0)
    }, [isOpen])

    const executeCommand = useCallback((command) => {
        command.action()
        onClose()
    }, [onClose])

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (filteredCommands[selectedIndex]) {
                executeCommand(filteredCommands[selectedIndex])
            }
        } else if (e.key === 'Escape') {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="command-palette-overlay" onClick={onClose}>
            <div className="command-palette" onClick={e => e.stopPropagation()}>
                <div className="command-input-wrapper">
                    <span className="command-icon">🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Komut ara... (Ctrl+K)"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
                        onKeyDown={handleKeyDown}
                    />
                    <kbd>ESC</kbd>
                </div>

                <div className="command-list">
                    {Object.entries(groupedCommands).map(([category, cmds]) => (
                        <div key={category} className="command-group">
                            <div className="command-group-title">{category}</div>
                            {cmds.map((cmd, i) => {
                                const globalIndex = filteredCommands.indexOf(cmd)
                                return (
                                    <div
                                        key={cmd.id}
                                        className={`command-item ${globalIndex === selectedIndex ? 'selected' : ''}`}
                                        onClick={() => executeCommand(cmd)}
                                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                                    >
                                        <span className="command-item-icon">{cmd.icon}</span>
                                        <span className="command-item-label">{cmd.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    ))}

                    {filteredCommands.length === 0 && (
                        <div className="command-empty">
                            <span>😕</span>
                            <p>Sonuç bulunamadı</p>
                        </div>
                    )}
                </div>

                <div className="command-footer">
                    <span><kbd>↑</kbd><kbd>↓</kbd> gezin</span>
                    <span><kbd>Enter</kbd> seç</span>
                    <span><kbd>Esc</kbd> kapat</span>
                </div>
            </div>
        </div>
    )
}

export default CommandPalette
