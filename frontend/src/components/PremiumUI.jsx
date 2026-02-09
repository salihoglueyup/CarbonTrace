import { useState, useRef, useEffect, useCallback } from 'react'

// ============================================
// TABS COMPONENT
// ============================================
export const Tabs = ({
    tabs = [],
    defaultTab = 0,
    variant = 'underline',
    onChange,
    fullWidth = false
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab)
    const [indicatorStyle, setIndicatorStyle] = useState({})
    const tabRefs = useRef([])

    const updateIndicator = useCallback((index) => {
        const tab = tabRefs.current[index]
        if (tab && variant === 'underline') {
            setIndicatorStyle({
                left: tab.offsetLeft,
                width: tab.offsetWidth
            })
        }
    }, [variant])

    useEffect(() => {
        updateIndicator(activeTab)
    }, [activeTab, updateIndicator])

    const handleTabClick = (index) => {
        setActiveTab(index)
        if (onChange) onChange(index, tabs[index])
    }

    return (
        <div className={`tabs tabs-${variant} ${fullWidth ? 'tabs-fullwidth' : ''}`}>
            <div className="tabs-header">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        ref={el => tabRefs.current[index] = el}
                        className={`tab-item ${activeTab === index ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
                        onClick={() => !tab.disabled && handleTabClick(index)}
                        disabled={tab.disabled}
                    >
                        {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                        <span className="tab-label">{tab.label}</span>
                        {tab.badge && <span className="tab-badge">{tab.badge}</span>}
                    </button>
                ))}
                {variant === 'underline' && (
                    <div className="tab-indicator" style={indicatorStyle} />
                )}
            </div>
            <div className="tabs-content">
                {tabs[activeTab]?.content}
            </div>
        </div>
    )
}

// ============================================
// STEPPER COMPONENT
// ============================================
export const Stepper = ({
    steps = [],
    currentStep = 0,
    orientation = 'horizontal',
    onStepClick,
    showLabels = true,
    clickable = false
}) => {
    return (
        <div className={`stepper stepper-${orientation}`}>
            {steps.map((step, index) => {
                const status = index < currentStep ? 'completed' : index === currentStep ? 'active' : 'pending'

                return (
                    <div
                        key={index}
                        className={`stepper-item stepper-${status} ${clickable ? 'clickable' : ''}`}
                        onClick={() => clickable && onStepClick?.(index)}
                    >
                        <div className="stepper-indicator">
                            {status === 'completed' ? (
                                <span className="stepper-check">✓</span>
                            ) : (
                                <span className="stepper-number">{index + 1}</span>
                            )}
                        </div>
                        {showLabels && (
                            <div className="stepper-content">
                                <div className="stepper-title">{step.title}</div>
                                {step.description && (
                                    <div className="stepper-description">{step.description}</div>
                                )}
                            </div>
                        )}
                        {index < steps.length - 1 && (
                            <div className={`stepper-connector ${status === 'completed' ? 'completed' : ''}`} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ============================================
// RATING COMPONENT
// ============================================
export const Rating = ({
    value = 0,
    max = 5,
    onChange,
    readonly = false,
    size = 'medium',
    icon = 'star',
    color = 'var(--bbva-orange)',
    showValue = false
}) => {
    const [hoverValue, setHoverValue] = useState(0)

    const getIcon = (filled) => {
        switch (icon) {
            case 'star':
                return filled ? '★' : '☆'
            case 'heart':
                return filled ? '❤️' : '🤍'
            case 'emoji': {
                const emojis = ['😞', '😕', '😐', '🙂', '😊']
                return emojis[Math.min(filled - 1, 4)] || '😐'
            }
            default:
                return filled ? '★' : '☆'
        }
    }

    const handleClick = (index) => {
        if (!readonly && onChange) {
            onChange(index + 1)
        }
    }

    return (
        <div className={`rating rating-${size} ${readonly ? 'readonly' : ''}`}>
            <div className="rating-items">
                {icon === 'emoji' ? (
                    Array.from({ length: max }, (_, i) => (
                        <button
                            key={i}
                            className={`rating-item ${i + 1 <= (hoverValue || value) ? 'active' : ''}`}
                            onClick={() => handleClick(i)}
                            onMouseEnter={() => !readonly && setHoverValue(i + 1)}
                            onMouseLeave={() => setHoverValue(0)}
                            disabled={readonly}
                        >
                            {getIcon(i + 1)}
                        </button>
                    ))
                ) : (
                    Array.from({ length: max }, (_, i) => (
                        <button
                            key={i}
                            className={`rating-item ${i + 1 <= (hoverValue || value) ? 'active' : ''}`}
                            style={{ color: i + 1 <= (hoverValue || value) ? color : undefined }}
                            onClick={() => handleClick(i)}
                            onMouseEnter={() => !readonly && setHoverValue(i + 1)}
                            onMouseLeave={() => setHoverValue(0)}
                            disabled={readonly}
                        >
                            {getIcon(i + 1 <= (hoverValue || value))}
                        </button>
                    ))
                )}
            </div>
            {showValue && (
                <span className="rating-value">{value} / {max}</span>
            )}
        </div>
    )
}

// ============================================
// EMPTY STATE
// ============================================
export const EmptyState = ({
    icon = '📭',
    title = 'Veri bulunamadı',
    description = '',
    action,
    actionText = 'Ekle',
    variant = 'default'
}) => {
    return (
        <div className={`empty-state empty-state-${variant}`}>
            <div className="empty-state-icon">{icon}</div>
            <h3 className="empty-state-title">{title}</h3>
            {description && <p className="empty-state-description">{description}</p>}
            {action && (
                <button className="btn btn-primary empty-state-action" onClick={action}>
                    {actionText}
                </button>
            )}
        </div>
    )
}

// ============================================
// AVATAR STACK
// ============================================
export const AvatarStack = ({
    users = [],
    max = 4,
    size = 'medium',
    onClick
}) => {
    const visibleUsers = users.slice(0, max)
    const overflow = users.length - max

    return (
        <div className={`avatar-stack avatar-stack-${size}`} onClick={onClick}>
            {visibleUsers.map((user, index) => (
                <div
                    key={index}
                    className="avatar-stack-item"
                    style={{ zIndex: visibleUsers.length - index }}
                    title={user.name}
                >
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                    ) : (
                        <span className="avatar-initials" style={{ background: user.color || 'var(--bbva-green)' }}>
                            {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                    )}
                </div>
            ))}
            {overflow > 0 && (
                <div className="avatar-stack-overflow">
                    +{overflow}
                </div>
            )}
        </div>
    )
}

// ============================================
// FLOATING ACTION BUTTON
// ============================================
export const FloatingActionButton = ({
    icon = '+',
    actions = [],
    position = 'bottom-right',
    color = 'var(--bbva-green)'
}) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={`fab-container fab-${position} ${isOpen ? 'open' : ''}`}>
            {actions.length > 0 && isOpen && (
                <div className="fab-actions">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            className="fab-action"
                            onClick={() => {
                                action.onClick?.()
                                setIsOpen(false)
                            }}
                            title={action.label}
                        >
                            <span className="fab-action-icon">{action.icon}</span>
                            <span className="fab-action-label">{action.label}</span>
                        </button>
                    ))}
                </div>
            )}
            <button
                className="fab-main"
                style={{ background: color }}
                onClick={() => actions.length > 0 ? setIsOpen(!isOpen) : null}
            >
                <span className={`fab-icon ${isOpen ? 'rotated' : ''}`}>{icon}</span>
            </button>
        </div>
    )
}

// ============================================
// CONFETTI
// ============================================
export const Confetti = ({ active = false, duration = 3000 }) => {
    const particlesRef = useRef(null)

    // Generate particles once per activation
    if (active && !particlesRef.current) {
        const colors = ['#00874A', '#004481', '#F39200', '#E53E3E', '#805AD5']
        particlesRef.current = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 500,
            rotation: Math.random() * 360
        }))
    }

    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (active) {
            setVisible(true)
            const timer = setTimeout(() => setVisible(false), duration)
            return () => clearTimeout(timer)
        }
    }, [active, duration])

    if (!active || !visible || !particlesRef.current) return null

    return (
        <div className="confetti-container">
            {particlesRef.current.map(particle => (
                <div
                    key={particle.id}
                    className="confetti-particle"
                    style={{
                        left: `${particle.x}%`,
                        backgroundColor: particle.color,
                        animationDelay: `${particle.delay}ms`,
                        transform: `rotate(${particle.rotation}deg)`
                    }}
                />
            ))}
        </div>
    )
}

export default { Tabs, Stepper, Rating, EmptyState, AvatarStack, FloatingActionButton, Confetti }
