import { useState, useRef, useEffect } from 'react'

/**
 * Tooltip Bileşeni
 * 
 * Props:
 * - content: string | ReactNode - Tooltip içeriği
 * - position: 'top' | 'bottom' | 'left' | 'right'
 * - delay: number - Gösterim gecikmesi (ms)
 * - children: ReactNode
 */
const Tooltip = ({
    content,
    position = 'top',
    delay = 200,
    children,
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(false)
    const [coords, setCoords] = useState({ x: 0, y: 0 })
    const triggerRef = useRef(null)
    const tooltipRef = useRef(null)
    const timeoutRef = useRef(null)

    const showTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect()
                setCoords({
                    x: rect.left + rect.width / 2,
                    y: rect.top
                })
                setIsVisible(true)
            }
        }, delay)
    }

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        setIsVisible(false)
    }

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return (
        <>
            <span
                ref={triggerRef}
                className={`tooltip-trigger ${className}`}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
            >
                {children}
            </span>

            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={`tooltip tooltip-${position}`}
                    style={{
                        left: coords.x,
                        top: position === 'bottom' ? coords.y + 40 : coords.y - 10
                    }}
                >
                    {content}
                    <div className="tooltip-arrow" />
                </div>
            )}
        </>
    )
}

export default Tooltip
