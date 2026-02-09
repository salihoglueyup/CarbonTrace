import { useState, useRef, useEffect } from 'react'

/**
 * DatePicker Bileşeni
 * 
 * Props:
 * - label: string
 * - value: Date | string
 * - onChange: function
 * - minDate: Date
 * - maxDate: Date
 * - placeholder: string
 * - error: string
 * - disabled: boolean
 * - required: boolean
 */
const DatePicker = ({
    label,
    value,
    onChange,
    minDate,
    maxDate,
    placeholder = 'Tarih seçin',
    error,
    disabled = false,
    required = false,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date())
    const containerRef = useRef(null)

    const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ]

    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Get calendar days
    const getCalendarDays = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()

        // Adjust for Monday start
        let startDay = firstDay.getDay() - 1
        if (startDay < 0) startDay = 6

        const calendarDays = []

        // Empty cells before first day
        for (let i = 0; i < startDay; i++) {
            calendarDays.push({ day: null, date: null })
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            calendarDays.push({ day, date })
        }

        return calendarDays
    }

    // Check if date is selected
    const isSelected = (date) => {
        if (!value || !date) return false
        const selectedDate = new Date(value)
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        )
    }

    // Check if date is today
    const isToday = (date) => {
        if (!date) return false
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    // Check if date is disabled
    const isDisabled = (date) => {
        if (!date) return true
        if (minDate && date < new Date(minDate)) return true
        if (maxDate && date > new Date(maxDate)) return true
        return false
    }

    // Handle date select
    const handleSelect = (date) => {
        if (!date || isDisabled(date)) return
        onChange?.({ target: { value: date.toISOString().split('T')[0] } })
        setIsOpen(false)
    }

    // Navigate months
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    // Format display value
    const formatValue = () => {
        if (!value) return ''
        const date = new Date(value)
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    // Quick select options
    const quickSelects = [
        { label: 'Bugün', date: new Date() },
        { label: 'Yarın', date: new Date(Date.now() + 86400000) },
        {
            label: 'Bu Hafta Sonu', date: (() => {
                const d = new Date()
                d.setDate(d.getDate() + (6 - d.getDay()))
                return d
            })()
        },
        { label: '1 Hafta Sonra', date: new Date(Date.now() + 7 * 86400000) },
        { label: '1 Ay Sonra', date: new Date(new Date().setMonth(new Date().getMonth() + 1)) }
    ]

    return (
        <div ref={containerRef} className={`datepicker-wrapper ${className} ${disabled ? 'disabled' : ''}`}>
            {/* Input Trigger */}
            <div
                className={`datepicker-trigger ${isOpen ? 'open' : ''} ${error ? 'has-error' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                {label && (
                    <label className={`datepicker-label ${value ? 'has-value' : ''}`}>
                        {label}
                        {required && <span className="required-mark">*</span>}
                    </label>
                )}
                <span className={`datepicker-value ${!value ? 'placeholder' : ''}`}>
                    {value ? formatValue() : placeholder}
                </span>
                <span className="datepicker-icon">📅</span>
            </div>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className="datepicker-dropdown">
                    {/* Quick Selects */}
                    <div className="datepicker-quick">
                        {quickSelects.map((qs, i) => (
                            <button
                                key={i}
                                className="quick-select-btn"
                                onClick={() => handleSelect(qs.date)}
                            >
                                {qs.label}
                            </button>
                        ))}
                    </div>

                    {/* Calendar Header */}
                    <div className="datepicker-header">
                        <button className="nav-btn" onClick={prevMonth}>◀</button>
                        <span className="current-month">
                            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button className="nav-btn" onClick={nextMonth}>▶</button>
                    </div>

                    {/* Day Names */}
                    <div className="datepicker-days-header">
                        {days.map(day => (
                            <span key={day} className="day-name">{day}</span>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="datepicker-grid">
                        {getCalendarDays().map((item, index) => (
                            <button
                                key={index}
                                className={`day-cell ${!item.day ? 'empty' : ''} ${isSelected(item.date) ? 'selected' : ''} ${isToday(item.date) ? 'today' : ''} ${isDisabled(item.date) ? 'disabled' : ''}`}
                                onClick={() => handleSelect(item.date)}
                                disabled={isDisabled(item.date)}
                            >
                                {item.day}
                            </button>
                        ))}
                    </div>

                    {/* Clear Button */}
                    {value && (
                        <button
                            className="datepicker-clear"
                            onClick={() => {
                                onChange?.({ target: { value: '' } })
                                setIsOpen(false)
                            }}
                        >
                            ✕ Temizle
                        </button>
                    )}
                </div>
            )}

            {/* Error */}
            {error && <span className="datepicker-error">{error}</span>}
        </div>
    )
}

export default DatePicker
