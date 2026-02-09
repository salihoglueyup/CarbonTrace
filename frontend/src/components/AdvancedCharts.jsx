import { useState, useEffect, useRef } from 'react'

// ============================================
// DONUT CHART
// ============================================
export const DonutChart = ({
    data = [],
    size = 200,
    strokeWidth = 40,
    showLegend = true,
    showValue = true,
    centerLabel = '',
    centerValue = ''
}) => {
    const [animatedData, setAnimatedData] = useState(data.map(d => ({ ...d, value: 0 })))
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const center = size / 2

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedData(data)
        }, 100)
        return () => clearTimeout(timer)
    }, [data])

    const total = data.reduce((sum, item) => sum + item.value, 0)
    let cumulativePercent = 0

    const segments = animatedData.map((item, index) => {
        const percent = total > 0 ? item.value / total : 0
        const startAngle = cumulativePercent * 360
        cumulativePercent += percent

        const strokeDasharray = `${percent * circumference} ${circumference}`
        const strokeDashoffset = -cumulativePercent * circumference + percent * circumference

        return (
            <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                    transform: `rotate(-90deg)`,
                    transformOrigin: 'center',
                    transition: 'stroke-dasharray 1s ease-out'
                }}
            />
        )
    })

    return (
        <div className="donut-chart-container">
            <svg width={size} height={size} className="donut-chart">
                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="var(--bbva-gray-100)"
                    strokeWidth={strokeWidth}
                />
                {segments}
                {(centerLabel || centerValue) && (
                    <g>
                        <text
                            x={center}
                            y={center - 8}
                            textAnchor="middle"
                            className="donut-center-value"
                        >
                            {centerValue}
                        </text>
                        <text
                            x={center}
                            y={center + 16}
                            textAnchor="middle"
                            className="donut-center-label"
                        >
                            {centerLabel}
                        </text>
                    </g>
                )}
            </svg>

            {showLegend && (
                <div className="donut-legend">
                    {data.map((item, index) => (
                        <div key={index} className="donut-legend-item">
                            <span
                                className="donut-legend-color"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="donut-legend-label">{item.label}</span>
                            {showValue && (
                                <span className="donut-legend-value">{item.value}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ============================================
// AREA CHART
// ============================================
export const AreaChart = ({
    data = [],
    width = 400,
    height = 200,
    color = 'var(--bbva-green)',
    gradientColor = 'rgba(0, 135, 74, 0.2)',
    showGrid = true,
    showTooltip = true,
    showPoints = true,
    animate = true
}) => {
    const [hoveredPoint, setHoveredPoint] = useState(null)
    const [isAnimated, setIsAnimated] = useState(!animate)

    const padding = { top: 20, right: 20, bottom: 30, left: 40 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    useEffect(() => {
        if (animate) {
            setTimeout(() => setIsAnimated(true), 100)
        }
    }, [animate])

    if (data.length === 0) return null

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1
    const minValue = 0

    const points = data.map((d, i) => ({
        x: padding.left + (i / (data.length - 1)) * chartWidth,
        y: padding.top + chartHeight - ((d.value - minValue) / (maxValue - minValue)) * chartHeight,
        ...d
    }))

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`

    const gradientId = `area-gradient-${Math.random().toString(36).substr(2, 9)}`

    return (
        <div className="area-chart-container">
            <svg width={width} height={height} className="area-chart">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {showGrid && (
                    <g className="chart-grid">
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                            <line
                                key={i}
                                x1={padding.left}
                                y1={padding.top + chartHeight * ratio}
                                x2={width - padding.right}
                                y2={padding.top + chartHeight * ratio}
                                stroke="var(--bbva-gray-100)"
                                strokeDasharray="4 4"
                            />
                        ))}
                    </g>
                )}

                {/* Area */}
                <path
                    d={areaPath}
                    fill={`url(#${gradientId})`}
                    className={`area-path ${isAnimated ? 'animated' : ''}`}
                />

                {/* Line */}
                <path
                    d={linePath}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={`line-path ${isAnimated ? 'animated' : ''}`}
                />

                {/* Points */}
                {showPoints && points.map((point, i) => (
                    <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r={hoveredPoint === i ? 6 : 4}
                        fill={color}
                        stroke="white"
                        strokeWidth="2"
                        className="chart-point"
                        onMouseEnter={() => setHoveredPoint(i)}
                        onMouseLeave={() => setHoveredPoint(null)}
                    />
                ))}

                {/* X-axis labels */}
                {data.map((d, i) => (
                    <text
                        key={i}
                        x={padding.left + (i / (data.length - 1)) * chartWidth}
                        y={height - 8}
                        textAnchor="middle"
                        className="chart-label"
                    >
                        {d.label}
                    </text>
                ))}

                {/* Tooltip */}
                {showTooltip && hoveredPoint !== null && (
                    <g className="chart-tooltip">
                        <rect
                            x={points[hoveredPoint].x - 40}
                            y={points[hoveredPoint].y - 35}
                            width="80"
                            height="28"
                            rx="4"
                            fill="var(--bbva-dark)"
                        />
                        <text
                            x={points[hoveredPoint].x}
                            y={points[hoveredPoint].y - 16}
                            textAnchor="middle"
                            fill="white"
                            fontSize="12"
                        >
                            {points[hoveredPoint].value}
                        </text>
                    </g>
                )}
            </svg>
        </div>
    )
}

// ============================================
// RADAR CHART
// ============================================
export const RadarChart = ({
    data = [],
    size = 250,
    color = 'var(--bbva-green)',
    fillOpacity = 0.3,
    showLabels = true,
    showValues = false,
    levels = 5
}) => {
    const center = size / 2
    const radius = (size - 60) / 2

    if (data.length < 3) return null

    const angleStep = (2 * Math.PI) / data.length
    const maxValue = Math.max(...data.map(d => d.max || 100))

    const getPoint = (value, index) => {
        const angle = angleStep * index - Math.PI / 2
        const r = (value / maxValue) * radius
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        }
    }

    // Create polygon path
    const polygonPoints = data
        .map((d, i) => {
            const point = getPoint(d.value, i)
            return `${point.x},${point.y}`
        })
        .join(' ')

    // Create axis lines and level circles
    const axisLines = data.map((d, i) => {
        const point = getPoint(maxValue, i)
        return (
            <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="var(--bbva-gray-200)"
                strokeWidth="1"
            />
        )
    })

    const levelCircles = Array.from({ length: levels }, (_, i) => {
        const levelRadius = (radius / levels) * (i + 1)
        const levelPoints = data
            .map((_, index) => {
                const angle = angleStep * index - Math.PI / 2
                return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`
            })
            .join(' ')

        return (
            <polygon
                key={`level-${i}`}
                points={levelPoints}
                fill="none"
                stroke="var(--bbva-gray-100)"
                strokeWidth="1"
            />
        )
    })

    const labels = showLabels && data.map((d, i) => {
        const angle = angleStep * i - Math.PI / 2
        const labelRadius = radius + 25
        const x = center + labelRadius * Math.cos(angle)
        const y = center + labelRadius * Math.sin(angle)

        return (
            <text
                key={`label-${i}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="radar-label"
            >
                {d.label}
            </text>
        )
    })

    return (
        <div className="radar-chart-container">
            <svg width={size} height={size} className="radar-chart">
                {levelCircles}
                {axisLines}
                <polygon
                    points={polygonPoints}
                    fill={color}
                    fillOpacity={fillOpacity}
                    stroke={color}
                    strokeWidth="2"
                    className="radar-polygon"
                />
                {/* Data points */}
                {data.map((d, i) => {
                    const point = getPoint(d.value, i)
                    return (
                        <circle
                            key={`point-${i}`}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill={color}
                            stroke="white"
                            strokeWidth="2"
                        />
                    )
                })}
                {labels}
            </svg>
        </div>
    )
}

// ============================================
// PROGRESS RING
// ============================================
export const ProgressRing = ({
    value = 0,
    max = 100,
    size = 120,
    strokeWidth = 10,
    color = 'var(--bbva-green)',
    bgColor = 'var(--bbva-gray-100)',
    showValue = true,
    label = ''
}) => {
    const [animatedValue, setAnimatedValue] = useState(0)
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const progress = (animatedValue / max) * circumference
    const center = size / 2

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedValue(value), 100)
        return () => clearTimeout(timer)
    }, [value])

    return (
        <div className="progress-ring-container">
            <svg width={size} height={size} className="progress-ring">
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center',
                        transition: 'stroke-dashoffset 1s ease-out'
                    }}
                />
                {showValue && (
                    <text
                        x={center}
                        y={center}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="progress-ring-value"
                    >
                        {Math.round(animatedValue)}%
                    </text>
                )}
            </svg>
            {label && <div className="progress-ring-label">{label}</div>}
        </div>
    )
}

export default { DonutChart, AreaChart, RadarChart, ProgressRing }
