import { useState, useRef, useEffect, useId } from 'react'

/**
 * Premium Select Bileşeni
 * 
 * Props:
 * - label: string - Select etiketi
 * - options: array - [{value, label, icon?}]
 * - value: string | array - Seçili değer(ler)
 * - onChange: function - Değişim fonksiyonu
 * - multiple: boolean - Çoklu seçim
 * - searchable: boolean - Arama özelliği
 * - placeholder: string
 * - error: string
 * - disabled: boolean
 * - required: boolean
 */
const Select = ({
    label,
    options = [],
    value,
    onChange,
    multiple = false,
    searchable = false,
    placeholder = 'Seçiniz...',
    error,
    disabled = false,
    required = false,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const selectRef = useRef(null)
    const searchInputRef = useRef(null)
    const selectId = useId()

    // Filter options based on search
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Get display value
    const getDisplayValue = () => {
        if (multiple && Array.isArray(value)) {
            if (value.length === 0) return placeholder
            const selectedLabels = value.map(v =>
                options.find(opt => opt.value === v)?.label
            ).filter(Boolean)
            return selectedLabels.join(', ')
        }

        const selected = options.find(opt => opt.value === value)
        return selected ? selected.label : placeholder
    }

    // Handle option select
    const handleSelect = (optionValue) => {
        if (multiple) {
            const currentValue = Array.isArray(value) ? value : []
            const newValue = currentValue.includes(optionValue)
                ? currentValue.filter(v => v !== optionValue)
                : [...currentValue, optionValue]
            onChange({ target: { value: newValue } })
        } else {
            onChange({ target: { value: optionValue } })
            setIsOpen(false)
        }
        setSearchTerm('')
    }

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault()
                setIsOpen(true)
            }
            return
        }

        switch (e.key) {
            case 'Escape':
                setIsOpen(false)
                break
            case 'ArrowDown':
                e.preventDefault()
                setHighlightedIndex(i =>
                    i < filteredOptions.length - 1 ? i + 1 : i
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setHighlightedIndex(i => i > 0 ? i - 1 : i)
                break
            case 'Enter':
                e.preventDefault()
                if (filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex].value)
                }
                break
            default:
                break
        }
    }

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus search input when opened
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isOpen, searchable])

    // Reset highlighted index when search changes
    useEffect(() => {
        setHighlightedIndex(0)
    }, [searchTerm])

    const isSelected = (optionValue) => {
        if (multiple && Array.isArray(value)) {
            return value.includes(optionValue)
        }
        return value === optionValue
    }

    return (
        <div
            ref={selectRef}
            className={`premium-select-wrapper ${className} ${disabled ? 'disabled' : ''} ${error ? 'has-error' : ''}`}
        >
            {/* Trigger */}
            <div
                className={`premium-select-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                tabIndex={disabled ? -1 : 0}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-labelledby={`${selectId}-label`}
            >
                {label && (
                    <label id={`${selectId}-label`} className={`select-label ${value ? 'has-value' : ''}`}>
                        {label}
                        {required && <span className="required-mark">*</span>}
                    </label>
                )}

                <span className={`select-value ${!value ? 'placeholder' : ''}`}>
                    {getDisplayValue()}
                </span>

                <span className={`select-arrow ${isOpen ? 'open' : ''}`}>
                    ▼
                </span>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="premium-select-dropdown">
                    {/* Search Input */}
                    {searchable && (
                        <div className="select-search">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Ara..."
                                className="select-search-input"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <span className="search-icon">🔍</span>
                        </div>
                    )}

                    {/* Options List */}
                    <ul className="select-options" role="listbox">
                        {filteredOptions.length === 0 ? (
                            <li className="select-no-results">
                                Sonuç bulunamadı
                            </li>
                        ) : (
                            filteredOptions.map((option, index) => (
                                <li
                                    key={option.value}
                                    className={`select-option ${isSelected(option.value) ? 'selected' : ''} ${highlightedIndex === index ? 'highlighted' : ''}`}
                                    onClick={() => handleSelect(option.value)}
                                    role="option"
                                    aria-selected={isSelected(option.value)}
                                >
                                    {multiple && (
                                        <span className="option-checkbox">
                                            {isSelected(option.value) ? '☑' : '☐'}
                                        </span>
                                    )}
                                    {option.icon && (
                                        <span className="option-icon">{option.icon}</span>
                                    )}
                                    <span className="option-label">{option.label}</span>
                                    {!multiple && isSelected(option.value) && (
                                        <span className="option-check">✓</span>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <span className="select-error">{error}</span>
            )}
        </div>
    )
}

export default Select
