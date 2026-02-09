import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * Modal Bileşeni
 * 
 * Props:
 * - isOpen: boolean - Modal açık mı
 * - onClose: function - Kapatma fonksiyonu
 * - title: string - Modal başlığı
 * - size: 'sm' | 'md' | 'lg' | 'xl' - Modal boyutu
 * - showClose: boolean - X butonu göster
 * - closeOnOverlay: boolean - Overlay'e tıklayınca kapat
 * - closeOnEscape: boolean - ESC ile kapat
 * - footer: ReactNode - Footer içeriği
 * - children: ReactNode - Modal içeriği
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    size = 'md',
    showClose = true,
    closeOnOverlay = true,
    closeOnEscape = true,
    footer,
    children
}) => {
    const modalRef = useRef(null)

    // ESC tuşu ile kapatma
    useEffect(() => {
        if (!isOpen || !closeOnEscape) return

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose, closeOnEscape])

    // Body scroll lock
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

    // Focus trap
    useEffect(() => {
        if (!isOpen || !modalRef.current) return

        const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )

        if (focusableElements.length > 0) {
            focusableElements[0].focus()
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleOverlayClick = (e) => {
        if (closeOnOverlay && e.target === e.currentTarget) {
            onClose()
        }
    }

    const sizeClasses = {
        sm: 'modal-sm',
        md: 'modal-md',
        lg: 'modal-lg',
        xl: 'modal-xl'
    }

    return createPortal(
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div
                ref={modalRef}
                className={`modal-content ${sizeClasses[size]}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header */}
                <div className="modal-header">
                    <h3 id="modal-title" className="modal-title">{title}</h3>
                    {showClose && (
                        <button
                            className="modal-close"
                            onClick={onClose}
                            aria-label="Kapat"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="modal-body">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}

export default Modal
