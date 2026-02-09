/**
 * Badge Bileşeni
 * 
 * Props:
 * - variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 * - size: 'sm' | 'md' | 'lg'
 * - dot: boolean - Sadece nokta göster
 * - pulse: boolean - Animasyonlu
 * - children: ReactNode
 */
const Badge = ({
    variant = 'neutral',
    size = 'md',
    dot = false,
    pulse = false,
    children,
    className = ''
}) => {
    if (dot) {
        return (
            <span className={`badge-dot ${variant} ${pulse ? 'pulse' : ''} ${className}`} />
        )
    }

    return (
        <span className={`badge badge-${variant} badge-${size} ${pulse ? 'pulse' : ''} ${className}`}>
            {children}
        </span>
    )
}

export default Badge
