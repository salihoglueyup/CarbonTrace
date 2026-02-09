import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

let toastId = 0

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, options = {}) => {
        const id = ++toastId
        const toast = {
            id,
            message,
            type: options.type || 'info', // success, error, warning, info
            duration: options.duration || 4000,
            action: options.action || null
        }

        setToasts(prev => [...prev, toast])

        // Auto remove
        if (toast.duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, toast.duration)
        }

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const success = useCallback((message, options = {}) => {
        return addToast(message, { ...options, type: 'success' })
    }, [addToast])

    const error = useCallback((message, options = {}) => {
        return addToast(message, { ...options, type: 'error' })
    }, [addToast])

    const warning = useCallback((message, options = {}) => {
        return addToast(message, { ...options, type: 'warning' })
    }, [addToast])

    const info = useCallback((message, options = {}) => {
        return addToast(message, { ...options, type: 'info' })
    }, [addToast])

    const value = {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info
    }

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
    if (toasts.length === 0) return null

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                    onClick={() => removeToast(toast.id)}
                >
                    <div className="toast-icon">
                        {toast.type === 'success' && '✓'}
                        {toast.type === 'error' && '✕'}
                        {toast.type === 'warning' && '⚠'}
                        {toast.type === 'info' && 'ℹ'}
                    </div>
                    <div className="toast-message">{toast.message}</div>
                    <button className="toast-close" onClick={(e) => {
                        e.stopPropagation()
                        removeToast(toast.id)
                    }}>×</button>
                </div>
            ))}
        </div>
    )
}

export default ToastContext
