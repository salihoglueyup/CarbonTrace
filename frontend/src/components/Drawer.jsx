import { useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * Drawer Bileşeni
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - position: 'left' | 'right'
 * - size: 'sm' | 'md' | 'lg' | 'full'
 * - title: string
 * - children: ReactNode
 */
const Drawer = ({
    isOpen,
    onClose,
    position = 'right',
    size = 'md',
    title,
    children,
    className = ''
}) => {
    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose?.()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEsc)
        }
        return () => document.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return createPortal(
        <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div
                className={`drawer drawer-${position} drawer-${size} ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {title && (
                    <div className="drawer-header">
                        <h3>{title}</h3>
                        <button className="drawer-close" onClick={onClose}>
                            ✕
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="drawer-content">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}

export default Drawer
