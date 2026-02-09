import { useState, useEffect } from 'react'

const FilterPanel = ({
    filters = [],
    values = {},
    onChange,
    onApply,
    onReset,
    collapsible = true,
    showSavedFilters = true
}) => {
    const [isOpen, setIsOpen] = useState(true)
    const [localValues, setLocalValues] = useState(values)
    const [savedFilters, setSavedFilters] = useState([])
    const [filterName, setFilterName] = useState('')
    const [showSaveModal, setShowSaveModal] = useState(false)

    useEffect(() => {
        setLocalValues(values)
    }, [values])

    useEffect(() => {
        // Load saved filters from localStorage
        const saved = localStorage.getItem('savedFilters')
        if (saved) {
            setSavedFilters(JSON.parse(saved))
        }
    }, [])

    const handleChange = (key, value) => {
        const newValues = { ...localValues, [key]: value }
        setLocalValues(newValues)
        if (onChange) onChange(newValues)
    }

    const handleApply = () => {
        if (onApply) onApply(localValues)
    }

    const handleReset = () => {
        const resetValues = {}
        filters.forEach(f => {
            resetValues[f.key] = f.defaultValue || ''
        })
        setLocalValues(resetValues)
        if (onReset) onReset(resetValues)
    }

    const saveFilter = () => {
        if (filterName.trim()) {
            const newFilter = { name: filterName, values: localValues }
            const updated = [...savedFilters, newFilter]
            setSavedFilters(updated)
            localStorage.setItem('savedFilters', JSON.stringify(updated))
            setShowSaveModal(false)
            setFilterName('')
        }
    }

    const loadFilter = (filter) => {
        setLocalValues(filter.values)
        if (onChange) onChange(filter.values)
    }

    const deleteFilter = (index, e) => {
        e.stopPropagation()
        const updated = savedFilters.filter((_, i) => i !== index)
        setSavedFilters(updated)
        localStorage.setItem('savedFilters', JSON.stringify(updated))
    }

    const getActiveFilterCount = () => {
        return Object.values(localValues).filter(v => v && v !== '' && v.length !== 0).length
    }

    const renderFilter = (filter) => {
        const value = localValues[filter.key]

        switch (filter.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        placeholder={filter.placeholder}
                        value={value || ''}
                        onChange={e => handleChange(filter.key, e.target.value)}
                        className="filter-input"
                    />
                )

            case 'select':
                return (
                    <select
                        value={value || ''}
                        onChange={e => handleChange(filter.key, e.target.value)}
                        className="filter-select"
                    >
                        <option value="">{filter.placeholder || 'Seçin...'}</option>
                        {filter.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                )

            case 'multiselect':
                return (
                    <div className="filter-multiselect">
                        {filter.options?.map(opt => (
                            <label key={opt.value} className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={(value || []).includes(opt.value)}
                                    onChange={e => {
                                        const current = value || []
                                        const newValue = e.target.checked
                                            ? [...current, opt.value]
                                            : current.filter(v => v !== opt.value)
                                        handleChange(filter.key, newValue)
                                    }}
                                />
                                <span>{opt.label}</span>
                            </label>
                        ))}
                    </div>
                )

            case 'range':
                return (
                    <div className="filter-range">
                        <input
                            type="range"
                            min={filter.min || 0}
                            max={filter.max || 100}
                            step={filter.step || 1}
                            value={value || filter.min || 0}
                            onChange={e => handleChange(filter.key, Number(e.target.value))}
                        />
                        <span className="range-value">{value || filter.min || 0}</span>
                    </div>
                )

            case 'date':
                return (
                    <input
                        type="date"
                        value={value || ''}
                        onChange={e => handleChange(filter.key, e.target.value)}
                        className="filter-input"
                    />
                )

            case 'daterange':
                return (
                    <div className="filter-daterange">
                        <input
                            type="date"
                            value={value?.start || ''}
                            onChange={e => handleChange(filter.key, { ...value, start: e.target.value })}
                            placeholder="Başlangıç"
                        />
                        <span>-</span>
                        <input
                            type="date"
                            value={value?.end || ''}
                            onChange={e => handleChange(filter.key, { ...value, end: e.target.value })}
                            placeholder="Bitiş"
                        />
                    </div>
                )

            case 'toggle':
                return (
                    <label className="filter-toggle">
                        <input
                            type="checkbox"
                            checked={value || false}
                            onChange={e => handleChange(filter.key, e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                )

            default:
                return null
        }
    }

    return (
        <div className={`filter-panel ${isOpen ? 'open' : ''}`}>
            {collapsible && (
                <button
                    className="filter-panel-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>🔍 Filtreler</span>
                    {getActiveFilterCount() > 0 && (
                        <span className="filter-badge">{getActiveFilterCount()}</span>
                    )}
                    <span className="toggle-icon">{isOpen ? '▲' : '▼'}</span>
                </button>
            )}

            {isOpen && (
                <div className="filter-panel-content">
                    {/* Saved Filters */}
                    {showSavedFilters && savedFilters.length > 0 && (
                        <div className="saved-filters">
                            <label>Kayıtlı Filtreler:</label>
                            <div className="saved-filter-list">
                                {savedFilters.map((filter, index) => (
                                    <div
                                        key={index}
                                        className="saved-filter-item"
                                        onClick={() => loadFilter(filter)}
                                    >
                                        <span>{filter.name}</span>
                                        <button onClick={(e) => deleteFilter(index, e)}>×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Filter Fields */}
                    <div className="filter-grid">
                        {filters.map(filter => (
                            <div key={filter.key} className="filter-group">
                                <label>{filter.label}</label>
                                {renderFilter(filter)}
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="filter-actions">
                        <button className="btn btn-outline" onClick={handleReset}>
                            🔄 Sıfırla
                        </button>
                        <button className="btn btn-outline" onClick={() => setShowSaveModal(true)}>
                            💾 Kaydet
                        </button>
                        <button className="btn btn-primary" onClick={handleApply}>
                            ✓ Uygula
                        </button>
                    </div>
                </div>
            )}

            {/* Save Filter Modal */}
            {showSaveModal && (
                <div className="filter-modal-overlay" onClick={() => setShowSaveModal(false)}>
                    <div className="filter-modal" onClick={e => e.stopPropagation()}>
                        <h4>Filtreyi Kaydet</h4>
                        <input
                            type="text"
                            placeholder="Filtre adı..."
                            value={filterName}
                            onChange={e => setFilterName(e.target.value)}
                            autoFocus
                        />
                        <div className="filter-modal-actions">
                            <button onClick={() => setShowSaveModal(false)}>İptal</button>
                            <button className="primary" onClick={saveFilter}>Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FilterPanel
