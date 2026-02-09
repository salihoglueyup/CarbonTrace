import { useEffect, useState } from 'react'

/**
 * KPI Card Bileşeni
 * 
 * Props:
 * - title: string - Kart başlığı
 * - value: number | string - Ana değer
 * - prefix: string - Değer öneki (€, $, vb.)
 * - suffix: string - Değer soneki (%, tCO2e, vb.)
 * - change: number - Değişim yüzdesi
 * - changeLabel: string - Değişim etiketi
 * - icon: string - Sol ikon
 * - color: 'green' | 'blue' | 'orange' | 'danger' - Renk teması
 * - trend: array - Mini sparkline data
 * - loading: boolean
 * - animate: boolean - Sayı animasyonu
 */
const KPICard = ({
    title,
    value,
    prefix = '',
    suffix = '',
    change,
    changeLabel = 'geçen aya göre',
    icon,
    color = 'green',
    trend = [],
    loading = false,
    animate = true,
    className = ''
}) => {
    const [displayValue, setDisplayValue] = useState(animate ? 0 : value)
    const [hasAnimated, setHasAnimated] = useState(false)

    // Animate number counting
    useEffect(() => {
        if (!animate || loading || hasAnimated) return
        if (typeof value !== 'number') {
            setDisplayValue(value)
            return
        }

        const duration = 1000
        const steps = 30
        const stepDuration = duration / steps
        const increment = value / steps

        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setDisplayValue(value)
                setHasAnimated(true)
                clearInterval(timer)
            } else {
                setDisplayValue(Math.floor(current))
            }
        }, stepDuration)

        return () => clearInterval(timer)
    }, [value, animate, loading, hasAnimated])

    const colorClasses = {
        green: 'kpi-green',
        blue: 'kpi-blue',
        orange: 'kpi-orange',
        danger: 'kpi-danger'
    }

    const formatValue = (val) => {
        if (typeof val === 'number') {
            return val.toLocaleString('tr-TR')
        }
        return val
    }

    if (loading) {
        return (
            <div className={`kpi-card ${className} loading`}>
                <div className="kpi-skeleton">
                    <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '40%', height: '32px' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
                </div>
            </div>
        )
    }

    return (
        <div className={`kpi-card ${colorClasses[color]} ${className}`}>
            {/* Header */}
            <div className="kpi-header">
                {icon && <span className="kpi-icon">{icon}</span>}
                <span className="kpi-title">{title}</span>
            </div>

            {/* Value */}
            <div className="kpi-value">
                {prefix && <span className="kpi-prefix">{prefix}</span>}
                <span className="kpi-number">{formatValue(displayValue)}</span>
                {suffix && <span className="kpi-suffix">{suffix}</span>}
            </div>

            {/* Trend/Change */}
            <div className="kpi-footer">
                {change !== undefined && (
                    <div className={`kpi-change ${change >= 0 ? 'positive' : 'negative'}`}>
                        <span className="change-arrow">
                            {change >= 0 ? '↑' : '↓'}
                        </span>
                        <span className="change-value">
                            {Math.abs(change)}%
                        </span>
                        <span className="change-label">{changeLabel}</span>
                    </div>
                )}

                {/* Mini Sparkline */}
                {trend.length > 0 && (
                    <svg className="kpi-sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <polyline
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            points={trend.map((val, i) => {
                                const x = (i / (trend.length - 1)) * 100
                                const max = Math.max(...trend)
                                const min = Math.min(...trend)
                                const range = max - min || 1
                                const y = 30 - ((val - min) / range) * 30
                                return `${x},${y}`
                            }).join(' ')}
                        />
                    </svg>
                )}
            </div>

            {/* Progress Ring (optional) */}
            {typeof value === 'number' && value <= 100 && suffix === '%' && (
                <div className="kpi-progress-ring">
                    <svg viewBox="0 0 36 36">
                        <path
                            className="ring-bg"
                            d="M18 2.0845
                               a 15.9155 15.9155 0 0 1 0 31.831
                               a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="ring-progress"
                            strokeDasharray={`${value}, 100`}
                            d="M18 2.0845
                               a 15.9155 15.9155 0 0 1 0 31.831
                               a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                </div>
            )}
        </div>
    )
}

export default KPICard
