import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const Documents = () => {
    const { language } = useLanguage()
    const [documents, setDocuments] = useState([])
    const [uploading, setUploading] = useState(false)
    const [selectedDoc, setSelectedDoc] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/documents')
            const data = await response.json()
            if (data.success) {
                setDocuments(data.documents)
            }
        } catch (error) {
            console.error('Error fetching documents:', error)
        }
    }

    const handleUpload = async (files) => {
        if (!files || files.length === 0) return

        setUploading(true)
        const file = files[0]

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('http://localhost:8000/api/documents/upload', {
                method: 'POST',
                body: formData
            })
            const data = await response.json()

            if (data.success) {
                fetchDocuments()
                setSelectedDoc(data)
            } else {
                alert(data.detail || (language === 'tr' ? 'Yükleme başarısız' : 'Upload failed'))
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert(language === 'tr' ? 'Yükleme başarısız' : 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm(language === 'tr' ? 'Bu dokümanı silmek istediğinize emin misiniz?' : 'Are you sure you want to delete this document?')) return

        try {
            await fetch(`http://localhost:8000/api/documents/${id}`, {
                method: 'DELETE'
            })
            fetchDocuments()
            if (selectedDoc?.document?.id === id) {
                setSelectedDoc(null)
            }
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase()
        switch (ext) {
            case 'pdf': return '📄'
            case 'xlsx':
            case 'xls': return '📊'
            case 'csv': return '📋'
            default: return '📁'
        }
    }

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <a href="/">Dashboard</a>
                <span className="separator">/</span>
                <span className="current">{language === 'tr' ? 'Dokümanlar' : 'Documents'}</span>
            </div>

            <div className="page-header">
                <div>
                    <h1>📎 {language === 'tr' ? 'Doküman Yönetimi' : 'Document Management'}</h1>
                    <p className="text-muted">
                        {language === 'tr'
                            ? 'Emisyon verilerinizi PDF, Excel veya CSV olarak yükleyin ve analiz edin'
                            : 'Upload and analyze your emission data as PDF, Excel or CSV'}
                    </p>
                </div>
            </div>

            <div className="documents-layout">
                {/* Upload Area */}
                <div className="card upload-card">
                    <div className="card-header">
                        <span>📤</span> Doküman Yükle
                    </div>
                    <div className="card-body">
                        <div
                            className={`upload-dropzone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.xlsx,.xls,.csv"
                                onChange={(e) => handleUpload(e.target.files)}
                                style={{ display: 'none' }}
                            />

                            {uploading ? (
                                <div className="upload-loading">
                                    <div className="spinner"></div>
                                    <p>Yükleniyor ve analiz ediliyor...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="upload-icon">📁</div>
                                    <p className="upload-text">
                                        Dosyayı sürükleyip bırakın veya <strong>tıklayın</strong>
                                    </p>
                                    <p className="upload-hint">PDF, Excel veya CSV (Max 10MB)</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Documents List */}
                <div className="card">
                    <div className="card-header">
                        <span>📋</span> Yüklenen Dokümanlar ({documents.length})
                    </div>
                    <div className="card-body">
                        {documents.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📭</span>
                                <p>Henüz doküman yüklenmemiş</p>
                            </div>
                        ) : (
                            <div className="documents-list">
                                {documents.map(doc => (
                                    <div
                                        key={doc.id}
                                        className={`document-item ${selectedDoc?.document?.id === doc.id ? 'active' : ''}`}
                                        onClick={() => setSelectedDoc({ document: doc })}
                                    >
                                        <span className="doc-icon">{getFileIcon(doc.filename)}</span>
                                        <div className="doc-info">
                                            <h4>{doc.filename}</h4>
                                            <p>{formatFileSize(doc.size)} • {new Date(doc.uploaded_at).toLocaleDateString('tr-TR')}</p>
                                        </div>
                                        <span className={`doc-status ${doc.status}`}>
                                            {doc.status === 'analyzed' ? '✅' : '⚠️'}
                                        </span>
                                        <button
                                            className="btn-icon-sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(doc.id)
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Analysis Results */}
            {selectedDoc?.analysis && (
                <div className="card mt-4">
                    <div className="card-header">
                        <span>🔍</span> Analiz Sonuçları
                    </div>
                    <div className="card-body">
                        {selectedDoc.analysis.success ? (
                            <div className="analysis-results">
                                {selectedDoc.analysis.extracted_data?.emissions_found?.length > 0 && (
                                    <div className="analysis-section">
                                        <h4>🌿 Bulunan Emisyon Verileri</h4>
                                        <div className="data-chips">
                                            {selectedDoc.analysis.extracted_data.emissions_found.map((e, i) => (
                                                <span key={i} className="data-chip green">
                                                    {e.value} {e.unit}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedDoc.analysis.extracted_data?.scopes_mentioned?.length > 0 && (
                                    <div className="analysis-section">
                                        <h4>📊 Bahsedilen Kapsamlar</h4>
                                        <div className="data-chips">
                                            {selectedDoc.analysis.extracted_data.scopes_mentioned.map((s, i) => (
                                                <span key={i} className="data-chip blue">
                                                    {s.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedDoc.analysis.extracted_data?.financial_data?.length > 0 && (
                                    <div className="analysis-section">
                                        <h4>💰 Finansal Veriler</h4>
                                        <div className="data-chips">
                                            {selectedDoc.analysis.extracted_data.financial_data.map((f, i) => (
                                                <span key={i} className="data-chip orange">
                                                    {f.currency}{f.amount}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedDoc.analysis.sheets && (
                                    <div className="analysis-section">
                                        <h4>📑 Excel Sayfaları</h4>
                                        <div className="data-chips">
                                            {selectedDoc.analysis.sheets.map((s, i) => (
                                                <span key={i} className="data-chip">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="error-state">
                                <span>⚠️</span>
                                <p>Analiz sırasında hata: {selectedDoc.analysis.error}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Documents
