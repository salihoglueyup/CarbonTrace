import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { calendarAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const Calendar = () => {
    const { language } = useLanguage()
    const { user } = useAuth()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(null)
    const [showEventModal, setShowEventModal] = useState(false)
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true)
                const data = await calendarAPI.getAll(user?.company_id)

                // Map API data to frontend format
                const formattedEvents = data.map(event => {
                    let type = 'task'
                    let color = '#00874A'

                    // Map category to type and color
                    switch (event.category) {
                        case 'Deadline': type = 'deadline'; color = '#E53E3E'; break;
                        case 'Meeting': type = 'meeting'; color = '#004481'; break;
                        case 'Training': type = 'training'; color = '#F39200'; break;
                        case 'Audit': type = 'audit'; color = '#805AD5'; break;
                        default: type = 'task'; color = '#00874A';
                    }

                    return {
                        id: event.id,
                        title: event.title,
                        date: new Date(event.start_date).toISOString().split('T')[0], // YYYY-MM-DD
                        type: type,
                        color: color,
                        description: event.description
                    }
                })

                setEvents(formattedEvents)
            } catch (err) {
                console.error('Error fetching events:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [user])

    // Debugging unused vars
    useEffect(() => {
        if (selectedDate) console.log('Selected Date:', selectedDate)
        if (showEventModal) console.log('Modal visible:', showEventModal)
    }, [selectedDate, showEventModal])

    const upcomingDeadlines = events
        .filter(e => e.type === 'deadline')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(e => {
            const today = new Date()
            const eventDate = new Date(e.date)
            const diffTime = eventDate - today
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            return {
                title: e.title,
                date: e.date,
                daysLeft: diffDays,
                priority: diffDays < 30 ? 'high' : 'medium'
            }
        })
        .slice(0, 5) // Show top 5


    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDay = firstDay.getDay()

        return { daysInMonth, startingDay, year, month }
    }

    const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentDate)

    const monthNames = language === 'tr'
        ? ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const dayNames = language === 'tr'
        ? ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const getEventsForDate = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return events.filter(e => e.date === dateStr)
    }

    const isToday = (day) => {
        const today = new Date()
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    }

    const renderCalendarDays = () => {
        const days = []

        // Empty cells before first day
        for (let i = 0; i < startingDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getEventsForDate(day)

            days.push(
                <div
                    key={day}
                    className={`calendar-day ${isToday(day) ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                >
                    <span className="day-number">{day}</span>
                    {dayEvents.length > 0 && (
                        <div className="day-events">
                            {dayEvents.slice(0, 2).map(event => (
                                <div
                                    key={event.id}
                                    className="event-dot"
                                    style={{ backgroundColor: event.color }}
                                    title={event.title}
                                ></div>
                            ))}
                            {dayEvents.length > 2 && (
                                <span className="more-events">+{dayEvents.length - 2}</span>
                            )}
                        </div>
                    )}
                </div>
            )
        }

        return days
    }

    if (loading) {
        return <div className="loading-container"><div className="loading-spinner"></div></div>
    }

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <a href="/">Dashboard</a>
                <span className="separator">/</span>
                <span className="current">Takvim</span>
            </div>

            <div className="page-header">
                <div>
                    <h1>📅 CBAM Takvimi</h1>
                    <p className="text-muted">Deadline'lar, toplantılar ve etkinlikleri yönetin</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowEventModal(true)}>
                    ➕ Etkinlik Ekle
                </button>
            </div>

            <div className="calendar-layout">
                {/* Calendar */}
                <div className="card calendar-card">
                    <div className="card-header calendar-header">
                        <button className="btn-icon" onClick={prevMonth}>◀</button>
                        <h3>{monthNames[month]} {year}</h3>
                        <button className="btn-icon" onClick={nextMonth}>▶</button>
                    </div>
                    <div className="card-body">
                        <div className="calendar-grid">
                            {/* Day names */}
                            {dayNames.map(day => (
                                <div key={day} className="calendar-day-name">{day}</div>
                            ))}
                            {/* Days */}
                            {renderCalendarDays()}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="calendar-sidebar">
                    {/* Upcoming Deadlines */}
                    <div className="card">
                        <div className="card-header">
                            <span>⏰</span> Yaklaşan Deadlinelar
                        </div>
                        <div className="card-body">
                            {upcomingDeadlines.map((deadline, i) => (
                                <div key={i} className="deadline-item">
                                    <div className={`deadline-priority ${deadline.priority}`}></div>
                                    <div className="deadline-info">
                                        <strong>{deadline.title}</strong>
                                        <small>{deadline.date}</small>
                                    </div>
                                    <div className="deadline-days">
                                        <span className={deadline.daysLeft < 30 ? 'urgent' : ''}>
                                            {deadline.daysLeft} gün
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Event Types Legend */}
                    <div className="card">
                        <div className="card-header">
                            <span>🏷️</span> Etkinlik Türleri
                        </div>
                        <div className="card-body">
                            <div className="legend-items">
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: '#E53E3E' }}></span>
                                    <span>Deadline</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: '#004481' }}></span>
                                    <span>Toplantı</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: '#00874A' }}></span>
                                    <span>Görev</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: '#F39200' }}></span>
                                    <span>Eğitim</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: '#9B2C2C' }}></span>
                                    <span>Milestone</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="card">
                        <div className="card-header">
                            <span>📊</span> Bu Ay
                        </div>
                        <div className="card-body">
                            <div className="quick-stats">
                                <div className="quick-stat">
                                    <span className="stat-number">{events.filter(e => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length}</span>
                                    <span className="stat-label">Etkinlik</span>
                                </div>
                                <div className="quick-stat">
                                    <span className="stat-number">{events.filter(e => e.type === 'deadline' && e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length}</span>
                                    <span className="stat-label">Deadline</span>
                                </div>
                                <div className="quick-stat">
                                    <span className="stat-number">{events.filter(e => e.type === 'meeting' && e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length}</span>
                                    <span className="stat-label">Toplantı</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Calendar
