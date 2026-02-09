import { useState, useRef, useEffect, useCallback } from 'react'

const RichTextEditor = ({
    value = '',
    onChange,
    placeholder = 'Metin girin...',
    minHeight = 200,
    maxHeight = 500,
    disabled = false
}) => {
    const editorRef = useRef(null)
    const [isFocused, setIsFocused] = useState(false)
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')

    useEffect(() => {
        if (editorRef.current && !editorRef.current.innerHTML && value) {
            editorRef.current.innerHTML = value
        }
    }, [value])

    const execCommand = useCallback((command, value = null) => {
        document.execCommand(command, false, value)
        editorRef.current?.focus()
        handleChange()
    }, [])

    const handleChange = () => {
        if (onChange && editorRef.current) {
            onChange(editorRef.current.innerHTML)
        }
    }

    const handleKeyDown = (e) => {
        // Tab key for indentation
        if (e.key === 'Tab') {
            e.preventDefault()
            execCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;')
        }
        // Ctrl+B for bold
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault()
            execCommand('bold')
        }
        // Ctrl+I for italic
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault()
            execCommand('italic')
        }
        // Ctrl+U for underline
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault()
            execCommand('underline')
        }
    }

    const insertLink = () => {
        if (linkUrl) {
            execCommand('createLink', linkUrl)
            setShowLinkModal(false)
            setLinkUrl('')
        }
    }

    const tools = [
        { icon: 'B', command: 'bold', title: 'Kalın (Ctrl+B)', style: { fontWeight: 'bold' } },
        { icon: 'I', command: 'italic', title: 'İtalik (Ctrl+I)', style: { fontStyle: 'italic' } },
        { icon: 'U', command: 'underline', title: 'Altı Çizili (Ctrl+U)', style: { textDecoration: 'underline' } },
        { icon: 'S', command: 'strikeThrough', title: 'Üstü Çizili', style: { textDecoration: 'line-through' } },
        { type: 'divider' },
        { icon: '•', command: 'insertUnorderedList', title: 'Madde İşareti' },
        { icon: '1.', command: 'insertOrderedList', title: 'Numaralı Liste' },
        { type: 'divider' },
        { icon: '←', command: 'outdent', title: 'Girintiyi Azalt' },
        { icon: '→', command: 'indent', title: 'Girintiyi Artır' },
        { type: 'divider' },
        { icon: '🔗', command: 'link', title: 'Link Ekle', action: () => setShowLinkModal(true) },
        {
            icon: '🖼️', command: 'insertImage', title: 'Resim Ekle', action: () => {
                const url = prompt('Resim URL:')
                if (url) execCommand('insertImage', url)
            }
        },
        { type: 'divider' },
        { icon: '⟲', command: 'undo', title: 'Geri Al' },
        { icon: '⟳', command: 'redo', title: 'Yinele' },
        { icon: '🗑️', command: 'removeFormat', title: 'Biçimlendirmeyi Kaldır' },
    ]

    return (
        <div className={`rich-text-editor ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}>
            {/* Toolbar */}
            <div className="rte-toolbar">
                {tools.map((tool, index) =>
                    tool.type === 'divider' ? (
                        <span key={index} className="rte-divider" />
                    ) : (
                        <button
                            key={index}
                            type="button"
                            className="rte-tool"
                            title={tool.title}
                            style={tool.style}
                            onClick={() => tool.action ? tool.action() : execCommand(tool.command)}
                            disabled={disabled}
                        >
                            {tool.icon}
                        </button>
                    )
                )}
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                className="rte-content"
                contentEditable={!disabled}
                onInput={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                data-placeholder={placeholder}
                style={{ minHeight, maxHeight }}
            />

            {/* Character Count */}
            <div className="rte-footer">
                <span className="rte-char-count">
                    {editorRef.current?.innerText?.length || 0} karakter
                </span>
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="rte-modal-overlay" onClick={() => setShowLinkModal(false)}>
                    <div className="rte-modal" onClick={e => e.stopPropagation()}>
                        <h4>Link Ekle</h4>
                        <input
                            type="url"
                            placeholder="https://..."
                            value={linkUrl}
                            onChange={e => setLinkUrl(e.target.value)}
                            autoFocus
                        />
                        <div className="rte-modal-actions">
                            <button onClick={() => setShowLinkModal(false)}>İptal</button>
                            <button className="primary" onClick={insertLink}>Ekle</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RichTextEditor
