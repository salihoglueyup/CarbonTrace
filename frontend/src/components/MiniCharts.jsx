/**
 * Mini Chart Bileşenleri
 * Sparkline, Donut, Progress Bar
 */

// Sparkline Chart
export const Sparkline = ({
    data = [],
    width = 100,
    height = 30,
    color = 'var(--bbva-green)',
    showArea = false,
    className = ''
}) => {
    if (data.length === 0) return null

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((val - min) / range) * height
        return `${x},${y}`
    }).join(' ')

    return (
        <svg
            className={`sparkline ${className}`}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
        >
            {showArea && (
                <polygon
                    fill={color}
                    fillOpacity="0.1"
                    points={`0,${height} ${points} ${width},${height}`}
                />
            )}
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    )
}

// Donut Chart
export const DonutChart = ({
    value = 0,
    max = 100,
    size = 80,
    strokeWidth = 8,
    color = 'var(--bbva-green)',
    bgColor = 'var(--bbva-gray-200)',
    showLabel = true,
    label,
    className = ''
}) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const percentage = Math.min(value / max, 1)
    const strokeDashoffset = circumference * (1 - percentage)

    return (
        <div className={`donut-chart ${className}`} style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${size} ${size}`}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            {showLabel && (
                <div className="donut-label">
                    <span className="donut-value">{label || `${Math.round(value)}%`}</span>
                </div>
            )}
        </div>
    )
}

// Progress Bar
export const ProgressBar = ({
    value = 0,
    max = 100,
    height = 8,
    color = 'var(--bbva-green)',
    bgColor = 'var(--bbva-gray-200)',
    showLabel = false,
    striped = false,
    animated = false,
    className = ''
}) => {
    const percentage = Math.min((value / max) * 100, 100)

    return (
        <div className={`progress-bar-wrapper ${className}`}>
            <div
                className="progress-bar-track"
                style={{ height, background: bgColor }}
            >
                <div
                    className={`progress-bar-fill ${striped ? 'striped' : ''} ${animated ? 'animated' : ''}`}
                    style={{
                        width: `${percentage}%`,
                        background: color,
                        height
                    }}
                />
            </div>
            {showLabel && (
                <span className="progress-label">{Math.round(percentage)}%</span>
            )}
        </div>
    )
}

// Bar Chart (mini)
export const MiniBarChart = ({
    data = [],
    height = 40,
    barWidth = 8,
    gap = 4,
    color = 'var(--bbva-green)',
    className = ''
}) => {
    if (data.length === 0) return null

    const max = Math.max(...data)
    const width = data.length * (barWidth + gap) - gap

    return (
        <svg
            className={`mini-bar-chart ${className}`}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
        >
            {data.map((val, i) => {
                const barHeight = (val / max) * height
                return (
                    <rect
                        key={i}
                        x={i * (barWidth + gap)}
                        y={height - barHeight}
                        width={barWidth}
                        height={barHeight}
                        fill={color}
                        rx={2}
                    />
                )
            })}
        </svg>
    )
}

export default { Sparkline, DonutChart, ProgressBar, MiniBarChart }
