import Modal from './Modal'

/**
 * Onay Dialog Bileşeni
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onConfirm: function - Onay fonksiyonu
 * - title: string
 * - message: string | ReactNode
 * - confirmText: string - Onay butonu metni
 * - cancelText: string - İptal butonu metni
 * - variant: 'danger' | 'warning' | 'info' - Buton rengi
 * - loading: boolean - Yüklenme durumu
 */
const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Onay',
    message = 'Bu işlemi yapmak istediğinizden emin misiniz?',
    confirmText = 'Onayla',
    cancelText = 'İptal',
    variant = 'danger',
    loading = false
}) => {
    const handleConfirm = async () => {
        if (onConfirm) {
            await onConfirm()
        }
        onClose()
    }

    const variantClasses = {
        danger: 'btn-danger',
        warning: 'btn-warning',
        info: 'btn-primary'
    }

    const variantIcons = {
        danger: '⚠️',
        warning: '⚡',
        info: 'ℹ️'
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            closeOnOverlay={!loading}
            closeOnEscape={!loading}
            footer={
                <div className="confirm-dialog-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${variantClasses[variant]}`}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-sm"></span>
                                İşleniyor...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            }
        >
            <div className="confirm-dialog-content">
                <span className="confirm-icon">{variantIcons[variant]}</span>
                <p className="confirm-message">{message}</p>
            </div>
        </Modal>
    )
}

export default ConfirmDialog
