import { useState, useRef, useEffect } from 'react'

// ============================================
// ACCORDION
// ============================================
export const Accordion = ({
    items = [],
    allowMultiple = false,
    defaultOpen = []
}) => {
    const [openItems, setOpenItems] = useState(defaultOpen)

    const toggleItem = (index) => {
        if (allowMultiple) {
            setOpenItems(prev =>
                prev.includes(index)
                    ? prev.filter(i => i !== index)
                    : [...prev, index]
            )
        } else {
            setOpenItems(prev => prev.includes(index) ? [] : [index])
        }
    }

    return (
        <div className="accordion">
            {items.map((item, index) => (
                <div key={index} className={`accordion-item ${openItems.includes(index) ? 'open' : ''}`}>
                    <button
                        className="accordion-header"
                        onClick={() => toggleItem(index)}
                        aria-expanded={openItems.includes(index)}
                    >
                        {item.icon && <span className="accordion-icon">{item.icon}</span>}
                        <span className="accordion-title">{item.title}</span>
                        <span className="accordion-arrow">▼</span>
                    </button>
                    <div className="accordion-content">
                        <div className="accordion-body">{item.content}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ============================================
// COLOR PICKER
// ============================================
export const ColorPicker = ({
    value = '#00874A',
    onChange,
    presets = ['#00874A', '#004481', '#F39200', '#E53E3E', '#805AD5', '#38A169', '#3182CE', '#DD6B20'],
    showInput = true,
    label = ''
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [customColor, setCustomColor] = useState(value)
    const pickerRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleColorSelect = (color) => {
        setCustomColor(color)
        if (onChange) onChange(color)
    }

    const handleCustomChange = (e) => {
        const color = e.target.value
        setCustomColor(color)
        if (onChange) onChange(color)
    }

    return (
        <div className="color-picker" ref={pickerRef}>
            {label && <label className="color-picker-label">{label}</label>}
            <div className="color-picker-trigger" onClick={() => setIsOpen(!isOpen)}>
                <span className="color-preview" style={{ backgroundColor: value }} />
                <span className="color-value">{value}</span>
                <span className="color-arrow">▼</span>
            </div>

            {isOpen && (
                <div className="color-picker-dropdown">
                    <div className="color-presets">
                        {presets.map((color, index) => (
                            <button
                                key={index}
                                className={`color-preset ${color === value ? 'active' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorSelect(color)}
                                aria-label={`Select ${color}`}
                            />
                        ))}
                    </div>
                    {showInput && (
                        <div className="color-custom">
                            <input
                                type="color"
                                value={customColor}
                                onChange={handleCustomChange}
                            />
                            <input
                                type="text"
                                value={customColor}
                                onChange={handleCustomChange}
                                placeholder="#000000"
                                maxLength={7}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ============================================
// COUNTDOWN TIMER
// ============================================
export const Countdown = ({
    targetDate,
    title = 'Kalan Süre',
    onComplete,
    showDays = true,
    showHours = true,
    showMinutes = true,
    showSeconds = true
}) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate) - new Date()

            if (difference <= 0) {
                setIsComplete(true)
                if (onComplete) onComplete()
                return { days: 0, hours: 0, minutes: 0, seconds: 0 }
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            }
        }

        setTimeLeft(calculateTimeLeft())
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
        return () => clearInterval(timer)
    }, [targetDate, onComplete])

    if (isComplete) {
        return (
            <div className="countdown countdown-complete">
                <span className="countdown-complete-text">⏰ Süre doldu!</span>
            </div>
        )
    }

    return (
        <div className="countdown">
            {title && <div className="countdown-title">{title}</div>}
            <div className="countdown-units">
                {showDays && (
                    <div className="countdown-unit">
                        <span className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</span>
                        <span className="countdown-label">Gün</span>
                    </div>
                )}
                {showHours && (
                    <div className="countdown-unit">
                        <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="countdown-label">Saat</span>
                    </div>
                )}
                {showMinutes && (
                    <div className="countdown-unit">
                        <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="countdown-label">Dakika</span>
                    </div>
                )}
                {showSeconds && (
                    <div className="countdown-unit">
                        <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        <span className="countdown-label">Saniye</span>
                    </div>
                )}
            </div>
        </div>
    )
}

// ============================================
// COPY TO CLIPBOARD
// ============================================
export const CopyButton = ({
    text,
    children = 'Kopyala',
    successText = 'Kopyalandı!',
    successDuration = 2000
}) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), successDuration)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <button
            className={`copy-button ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
        >
            <span className="copy-icon">{copied ? '✓' : '📋'}</span>
            <span className="copy-text">{copied ? successText : children}</span>
        </button>
    )
}

// ============================================
// SEARCH AUTOCOMPLETE
// ============================================
export const SearchAutocomplete = ({
    placeholder = 'Ara...',
    suggestions = [],
    onSearch,
    onSelect,
    minChars = 2
}) => {
    const [query, setQuery] = useState('')
    const [filtered, setFiltered] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const inputRef = useRef(null)

    useEffect(() => {
        if (query.length >= minChars) {
            const matches = suggestions.filter(s =>
                s.label.toLowerCase().includes(query.toLowerCase())
            )
            setFiltered(matches)
            setIsOpen(matches.length > 0)
        } else {
            setFiltered([])
            setIsOpen(false)
        }
    }, [query, suggestions, minChars])

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(prev => Math.min(prev + 1, filtered.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            handleSelect(filtered[activeIndex])
        } else if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    const handleSelect = (item) => {
        setQuery(item.label)
        setIsOpen(false)
        setActiveIndex(-1)
        if (onSelect) onSelect(item)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (onSearch) onSearch(query)
    }

    return (
        <div className="search-autocomplete">
            <form onSubmit={handleSubmit}>
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="search-input"
                    />
                    {query && (
                        <button
                            type="button"
                            className="search-clear"
                            onClick={() => { setQuery(''); setIsOpen(false) }}
                        >
                            ×
                        </button>
                    )}
                </div>
            </form>

            {isOpen && (
                <ul className="search-suggestions">
                    {filtered.map((item, index) => (
                        <li
                            key={index}
                            className={`search-suggestion ${index === activeIndex ? 'active' : ''}`}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setActiveIndex(index)}
                        >
                            {item.icon && <span className="suggestion-icon">{item.icon}</span>}
                            <span className="suggestion-label">{item.label}</span>
                            {item.description && (
                                <span className="suggestion-description">{item.description}</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

// ============================================
// CAROUSEL
// ============================================
export const Carousel = ({
    items = [],
    autoPlay = false,
    interval = 5000,
    showDots = true,
    showArrows = true
}) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const timerRef = useRef(null)

    useEffect(() => {
        if (autoPlay && items.length > 1) {
            timerRef.current = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % items.length)
            }, interval)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [autoPlay, interval, items.length])

    const goTo = (index) => {
        setCurrentIndex(index)
        if (timerRef.current) {
            clearInterval(timerRef.current)
            if (autoPlay) {
                timerRef.current = setInterval(() => {
                    setCurrentIndex(prev => (prev + 1) % items.length)
                }, interval)
            }
        }
    }

    const goNext = () => goTo((currentIndex + 1) % items.length)
    const goPrev = () => goTo((currentIndex - 1 + items.length) % items.length)

    if (items.length === 0) return null

    return (
        <div className="carousel">
            <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {items.map((item, index) => (
                    <div key={index} className="carousel-slide">
                        {item.image && <img src={item.image} alt={item.title || `Slide ${index + 1}`} />}
                        {item.content && <div className="carousel-content">{item.content}</div>}
                    </div>
                ))}
            </div>

            {showArrows && items.length > 1 && (
                <>
                    <button className="carousel-arrow carousel-prev" onClick={goPrev}>‹</button>
                    <button className="carousel-arrow carousel-next" onClick={goNext}>›</button>
                </>
            )}

            {showDots && items.length > 1 && (
                <div className="carousel-dots">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ============================================
// STAT CARD
// ============================================
export const StatCard = ({
    title,
    value,
    change,
    changeType = 'neutral',
    icon,
    trend = [],
    color = 'var(--bbva-green)'
}) => {
    const changeIcon = changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '→'

    return (
        <div className="stat-card">
            <div className="stat-card-header">
                {icon && <span className="stat-card-icon" style={{ background: color }}>{icon}</span>}
                <span className="stat-card-title">{title}</span>
            </div>
            <div className="stat-card-value">{value}</div>
            {change !== undefined && (
                <div className={`stat-card-change ${changeType}`}>
                    <span className="change-icon">{changeIcon}</span>
                    <span className="change-value">{change}</span>
                </div>
            )}
            {trend.length > 0 && (
                <div className="stat-card-trend">
                    <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path
                            d={`M 0,${30 - (trend[0] / Math.max(...trend)) * 30} ${trend.map((v, i) =>
                                `L ${(i / (trend.length - 1)) * 100},${30 - (v / Math.max(...trend)) * 30}`
                            ).join(' ')}`}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                        />
                    </svg>
                </div>
            )}
        </div>
    )
}

export default { Accordion, ColorPicker, Countdown, CopyButton, SearchAutocomplete, Carousel, StatCard }
