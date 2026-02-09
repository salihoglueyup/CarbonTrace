import { useState, useMemo } from 'react'

/**
 * Premium DataTable Bileşeni
 * 
 * Props:
 * - columns: array - [{key, label, sortable?, filterable?, render?}]
 * - data: array - Veri dizisi
 * - pagination: boolean - Sayfalama aktif
 * - pageSize: number - Sayfa başına kayıt
 * - selectable: boolean - Satır seçimi
 * - onRowClick: function
 * - onSelectionChange: function
 * - loading: boolean
 * - emptyMessage: string
 * - exportable: boolean
 */
const DataTable = ({
    columns = [],
    data = [],
    pagination = true,
    pageSize: initialPageSize = 10,
    selectable = false,
    onRowClick,
    onSelectionChange,
    loading = false,
    emptyMessage = 'Veri bulunamadı',
    exportable = false,
    className = ''
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
    const [filters, setFilters] = useState({})
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(initialPageSize)
    const [selectedRows, setSelectedRows] = useState([])
    const [showFilters, setShowFilters] = useState(false)

    // Apply sorting
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data

        return [...data].sort((a, b) => {
            const aVal = a[sortConfig.key]
            const bVal = b[sortConfig.key]

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }, [data, sortConfig])

    // Apply filters
    const filteredData = useMemo(() => {
        return sortedData.filter(row => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value) return true
                const cellValue = String(row[key] || '').toLowerCase()
                return cellValue.includes(value.toLowerCase())
            })
        })
    }, [sortedData, filters])

    // Pagination
    const totalPages = Math.ceil(filteredData.length / pageSize)
    const paginatedData = useMemo(() => {
        if (!pagination) return filteredData
        const start = (currentPage - 1) * pageSize
        return filteredData.slice(start, start + pageSize)
    }, [filteredData, currentPage, pageSize, pagination])

    // Handle sort
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    // Handle filter
    const handleFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setCurrentPage(1)
    }

    // Handle row selection
    const handleRowSelect = (rowId) => {
        const newSelection = selectedRows.includes(rowId)
            ? selectedRows.filter(id => id !== rowId)
            : [...selectedRows, rowId]

        setSelectedRows(newSelection)
        onSelectionChange?.(newSelection)
    }

    // Handle select all
    const handleSelectAll = () => {
        if (selectedRows.length === paginatedData.length) {
            setSelectedRows([])
            onSelectionChange?.([])
        } else {
            const allIds = paginatedData.map(row => row.id)
            setSelectedRows(allIds)
            onSelectionChange?.(allIds)
        }
    }

    // Export to CSV
    const handleExport = () => {
        const headers = columns.map(col => col.label).join(',')
        const rows = filteredData.map(row =>
            columns.map(col => String(row[col.key] || '')).join(',')
        ).join('\n')

        const csv = `${headers}\n${rows}`
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'export.csv'
        a.click()
    }

    // Get sort icon
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕️'
        return sortConfig.direction === 'asc' ? '↑' : '↓'
    }

    if (loading) {
        return (
            <div className={`datatable ${className}`}>
                <div className="datatable-loading">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton skeleton-table-row"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={`datatable ${className}`}>
            {/* Toolbar */}
            <div className="datatable-toolbar">
                <div className="toolbar-left">
                    <button
                        className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        🔍 Filtrele
                    </button>
                    {Object.values(filters).some(v => v) && (
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setFilters({})}
                        >
                            ✕ Filtreleri Temizle
                        </button>
                    )}
                </div>
                <div className="toolbar-right">
                    {exportable && (
                        <button className="btn btn-sm btn-outline" onClick={handleExport}>
                            📥 CSV İndir
                        </button>
                    )}
                    <span className="record-count">
                        {filteredData.length} kayıt
                    </span>
                </div>
            </div>

            {/* Filter Row */}
            {showFilters && (
                <div className="datatable-filters">
                    {columns.filter(col => col.filterable !== false).map(col => (
                        <div key={col.key} className="filter-input">
                            <input
                                type="text"
                                placeholder={`${col.label} filtrele...`}
                                value={filters[col.key] || ''}
                                onChange={(e) => handleFilter(col.key, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="datatable-container">
                <table className="datatable-table">
                    <thead>
                        <tr>
                            {selectable && (
                                <th className="th-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={col.sortable !== false ? 'sortable' : ''}
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                >
                                    <span className="th-content">
                                        {col.label}
                                        {col.sortable !== false && (
                                            <span className="sort-icon">{getSortIcon(col.key)}</span>
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className="empty-cell">
                                    <div className="empty-state">
                                        <span className="empty-icon">📭</span>
                                        <p>{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => (
                                <tr
                                    key={row.id || index}
                                    className={`${selectedRows.includes(row.id) ? 'selected' : ''} ${onRowClick ? 'clickable' : ''}`}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {selectable && (
                                        <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(row.id)}
                                                onChange={() => handleRowSelect(row.id)}
                                            />
                                        </td>
                                    )}
                                    {columns.map(col => (
                                        <td key={col.key}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
                <div className="datatable-pagination">
                    <div className="pagination-info">
                        Sayfa {currentPage} / {totalPages}
                    </div>
                    <div className="pagination-controls">
                        <button
                            className="btn btn-sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(1)}
                        >
                            ⏮
                        </button>
                        <button
                            className="btn btn-sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            ◀
                        </button>

                        {/* Page Numbers */}
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            let pageNum
                            if (totalPages <= 5) {
                                pageNum = i + 1
                            } else if (currentPage <= 3) {
                                pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                            } else {
                                pageNum = currentPage - 2 + i
                            }

                            return (
                                <button
                                    key={pageNum}
                                    className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`}
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}

                        <button
                            className="btn btn-sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            ▶
                        </button>
                        <button
                            className="btn btn-sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(totalPages)}
                        >
                            ⏭
                        </button>
                    </div>
                    <div className="pagination-size">
                        <select value={pageSize} onChange={(e) => {
                            setPageSize(Number(e.target.value))
                            setCurrentPage(1)
                        }}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>kayıt/sayfa</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DataTable
