import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { ColorPicker } from './InteractiveUI'

const ThemeCustomizer = ({ isOpen, onClose }) => {
    const { theme, setTheme } = useTheme()
    const [customColors, setCustomColors] = useState({
        primary: '#00874A',
        secondary: '#004481',
        accent: '#F39200'
    })
    const [fontSize, setFontSize] = useState('medium')
    const [borderRadius, setBorderRadius] = useState('medium')

    // Load saved settings
    useEffect(() => {
        const saved = localStorage.getItem('theme-customizations')
        if (saved) {
            const parsed = JSON.parse(saved)
            setCustomColors(parsed.colors || customColors)
            setFontSize(parsed.fontSize || 'medium')
            setBorderRadius(parsed.borderRadius || 'medium')
        }
    }, [])

    // Apply custom CSS variables
    useEffect(() => {
        const root = document.documentElement
        root.style.setProperty('--bbva-green', customColors.primary)
        root.style.setProperty('--bbva-blue', customColors.secondary)
        root.style.setProperty('--bbva-orange', customColors.accent)

        // Font size
        const fontSizes = { small: '14px', medium: '16px', large: '18px' }
        root.style.setProperty('--base-font-size', fontSizes[fontSize])

        // Border radius
        const radiuses = { small: '4px', medium: '8px', large: '16px' }
        root.style.setProperty('--border-radius', radiuses[borderRadius])
        root.style.setProperty('--border-radius-sm', fontSize === 'small' ? '2px' : fontSize === 'large' ? '8px' : '4px')
    }, [customColors, fontSize, borderRadius])

    const saveSettings = () => {
        localStorage.setItem('theme-customizations', JSON.stringify({
            colors: customColors,
            fontSize,
            borderRadius
        }))
        onClose?.()
    }

    const resetSettings = () => {
        const defaults = {
            primary: '#00874A',
            secondary: '#004481',
            accent: '#F39200'
        }
        setCustomColors(defaults)
        setFontSize('medium')
        setBorderRadius('medium')
        localStorage.removeItem('theme-customizations')

        // Reset CSS variables
        const root = document.documentElement
        root.style.setProperty('--bbva-green', defaults.primary)
        root.style.setProperty('--bbva-blue', defaults.secondary)
        root.style.setProperty('--bbva-orange', defaults.accent)
        root.style.removeProperty('--base-font-size')
        root.style.removeProperty('--border-radius')
        root.style.removeProperty('--border-radius-sm')
    }

    const presetThemes = [
        { name: 'BBVA Default', primary: '#00874A', secondary: '#004481', accent: '#F39200' },
        { name: 'Ocean', primary: '#0077B6', secondary: '#023E8A', accent: '#00B4D8' },
        { name: 'Forest', primary: '#2D6A4F', secondary: '#1B4332', accent: '#40916C' },
        { name: 'Sunset', primary: '#E07A5F', secondary: '#3D405B', accent: '#F2CC8F' },
        { name: 'Purple', primary: '#7209B7', secondary: '#3A0CA3', accent: '#F72585' },
    ]

    if (!isOpen) return null

    return (
        <div className="theme-customizer-overlay" onClick={onClose}>
            <div className="theme-customizer" onClick={e => e.stopPropagation()}>
                <div className="customizer-header">
                    <h3>🎨 Tema Özelleştir</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="customizer-body">
                    {/* Theme Mode */}
                    <div className="customizer-section">
                        <label>Tema Modu</label>
                        <div className="theme-toggle-group">
                            <button
                                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                                onClick={() => setTheme('light')}
                            >
                                ☀️ Açık
                            </button>
                            <button
                                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                                onClick={() => setTheme('dark')}
                            >
                                🌙 Koyu
                            </button>
                        </div>
                    </div>

                    {/* Preset Themes */}
                    <div className="customizer-section">
                        <label>Hazır Temalar</label>
                        <div className="preset-themes">
                            {presetThemes.map((preset, index) => (
                                <button
                                    key={index}
                                    className="preset-theme-btn"
                                    onClick={() => setCustomColors({
                                        primary: preset.primary,
                                        secondary: preset.secondary,
                                        accent: preset.accent
                                    })}
                                    title={preset.name}
                                >
                                    <span style={{ background: preset.primary }} />
                                    <span style={{ background: preset.secondary }} />
                                    <span style={{ background: preset.accent }} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Colors */}
                    <div className="customizer-section">
                        <label>Özel Renkler</label>
                        <div className="color-options">
                            <ColorPicker
                                label="Ana Renk"
                                value={customColors.primary}
                                onChange={(color) => setCustomColors(prev => ({ ...prev, primary: color }))}
                            />
                            <ColorPicker
                                label="İkincil Renk"
                                value={customColors.secondary}
                                onChange={(color) => setCustomColors(prev => ({ ...prev, secondary: color }))}
                            />
                            <ColorPicker
                                label="Vurgu Rengi"
                                value={customColors.accent}
                                onChange={(color) => setCustomColors(prev => ({ ...prev, accent: color }))}
                            />
                        </div>
                    </div>

                    {/* Font Size */}
                    <div className="customizer-section">
                        <label>Yazı Boyutu</label>
                        <div className="option-group">
                            {['small', 'medium', 'large'].map(size => (
                                <button
                                    key={size}
                                    className={`option-btn ${fontSize === size ? 'active' : ''}`}
                                    onClick={() => setFontSize(size)}
                                >
                                    {size === 'small' ? 'Küçük' : size === 'medium' ? 'Orta' : 'Büyük'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Border Radius */}
                    <div className="customizer-section">
                        <label>Köşe Yuvarlaklığı</label>
                        <div className="option-group">
                            {['small', 'medium', 'large'].map(radius => (
                                <button
                                    key={radius}
                                    className={`option-btn ${borderRadius === radius ? 'active' : ''}`}
                                    onClick={() => setBorderRadius(radius)}
                                >
                                    {radius === 'small' ? 'Keskin' : radius === 'medium' ? 'Normal' : 'Yuvarlak'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="customizer-footer">
                    <button className="btn btn-outline" onClick={resetSettings}>
                        🔄 Sıfırla
                    </button>
                    <button className="btn btn-primary" onClick={saveSettings}>
                        ✓ Kaydet
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ThemeCustomizer
