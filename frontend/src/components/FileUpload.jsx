import { useState, useRef, useCallback } from 'react'

/**
 * FileUpload Bileşeni
 * 
 * Props:
 * - label: string
 * - accept: string - Kabul edilen dosya tipleri
 * - multiple: boolean - Çoklu dosya seçimi
 * - maxSize: number - Maksimum dosya boyutu (MB)
 * - maxFiles: number - Maksimum dosya sayısı
 * - onUpload: function - Dosyalar yüklendiğinde
 * - onRemove: function - Dosya silindiğinde
 * - disabled: boolean
 * - error: string
 * - preview: boolean - Önizleme göster
 */
const FileUpload = ({
    label = 'Dosya Yükle',
    accept = '*',
    multiple = false,
    maxSize = 10, // MB
    maxFiles = 5,
    onUpload,
    onRemove,
    disabled = false,
    error,
    preview = true,
    className = ''
}) => {
    const [files, setFiles] = useState([])
    const [isDragging, setIsDragging] = useState(false)
    const [uploadProgress, setUploadProgress] = useState({})
    const fileInputRef = useRef(null)

    // Validate file
    const validateFile = (file) => {
        const errors = []

        // Check size
        if (file.size > maxSize * 1024 * 1024) {
            errors.push(`Dosya boyutu ${maxSize}MB'dan büyük`)
        }

        // Check type
        if (accept !== '*') {
            const acceptedTypes = accept.split(',').map(t => t.trim())
            const fileType = file.type
            const fileExt = '.' + file.name.split('.').pop().toLowerCase()

            const isValid = acceptedTypes.some(type =>
                type.startsWith('.') ? fileExt === type : fileType.match(type.replace('*', '.*'))
            )

            if (!isValid) {
                errors.push('Geçersiz dosya tipi')
            }
        }

        return errors
    }

    // Get file icon
    const getFileIcon = (file) => {
        const type = file.type || ''
        if (type.startsWith('image/')) return '🖼️'
        if (type.startsWith('video/')) return '🎬'
        if (type.startsWith('audio/')) return '🎵'
        if (type.includes('pdf')) return '📕'
        if (type.includes('word') || type.includes('document')) return '📘'
        if (type.includes('excel') || type.includes('spreadsheet')) return '📗'
        if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦'
        return '📄'
    }

    // Format file size
    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    // Handle file selection
    const handleFiles = useCallback((selectedFiles) => {
        const fileArray = Array.from(selectedFiles)

        // Check max files
        if (files.length + fileArray.length > maxFiles) {
            alert(`En fazla ${maxFiles} dosya yükleyebilirsiniz`)
            return
        }

        const processedFiles = fileArray.map(file => {
            const errors = validateFile(file)
            const fileData = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                errors,
                preview: null
            }

            // Generate preview for images
            if (preview && file.type.startsWith('image/') && errors.length === 0) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    setFiles(prev => prev.map(f =>
                        f.id === fileData.id ? { ...f, preview: e.target.result } : f
                    ))
                }
                reader.readAsDataURL(file)
            }

            return fileData
        })

        const validFiles = processedFiles.filter(f => f.errors.length === 0)
        setFiles(prev => [...prev, ...processedFiles])

        if (validFiles.length > 0) {
            onUpload?.(validFiles.map(f => f.file))

            // Simulate upload progress
            validFiles.forEach(f => {
                let progress = 0
                const interval = setInterval(() => {
                    progress += Math.random() * 30
                    if (progress >= 100) {
                        progress = 100
                        clearInterval(interval)
                    }
                    setUploadProgress(prev => ({ ...prev, [f.id]: progress }))
                }, 200)
            })
        }
    }, [files, maxFiles, maxSize, accept, onUpload, preview])

    // Handle drag events
    const handleDragEnter = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled) setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (!disabled && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files)
        }
    }

    // Remove file
    const removeFile = (fileId) => {
        const file = files.find(f => f.id === fileId)
        setFiles(prev => prev.filter(f => f.id !== fileId))
        if (file && file.errors.length === 0) {
            onRemove?.(file.file)
        }
    }

    return (
        <div className={`file-upload-wrapper ${className} ${disabled ? 'disabled' : ''}`}>
            {/* Label */}
            {label && <label className="file-upload-label">{label}</label>}

            {/* Drop Zone */}
            <div
                className={`file-upload-dropzone ${isDragging ? 'dragging' : ''} ${error ? 'has-error' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => handleFiles(e.target.files)}
                    disabled={disabled}
                    style={{ display: 'none' }}
                />

                <div className="dropzone-content">
                    <span className="dropzone-icon">📤</span>
                    <p className="dropzone-text">
                        <strong>Dosyaları sürükleyin</strong> veya tıklayarak seçin
                    </p>
                    <span className="dropzone-hint">
                        Maks. {maxSize}MB • {multiple ? `En fazla ${maxFiles} dosya` : '1 dosya'}
                    </span>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="file-upload-list">
                    {files.map(file => (
                        <div key={file.id} className={`file-item ${file.errors.length > 0 ? 'has-error' : ''}`}>
                            {/* Preview */}
                            {preview && file.preview ? (
                                <img src={file.preview} alt={file.name} className="file-preview" />
                            ) : (
                                <span className="file-icon">{getFileIcon(file)}</span>
                            )}

                            {/* Info */}
                            <div className="file-info">
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{formatSize(file.size)}</span>
                                {file.errors.length > 0 && (
                                    <span className="file-error">{file.errors.join(', ')}</span>
                                )}
                            </div>

                            {/* Progress */}
                            {uploadProgress[file.id] !== undefined && uploadProgress[file.id] < 100 && file.errors.length === 0 && (
                                <div className="file-progress">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${uploadProgress[file.id]}%` }}
                                    />
                                </div>
                            )}

                            {/* Remove Button */}
                            <button
                                className="file-remove"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeFile(file.id)
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Error */}
            {error && <span className="file-upload-error">{error}</span>}
        </div>
    )
}

export default FileUpload
