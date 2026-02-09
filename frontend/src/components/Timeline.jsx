/**
 * Timeline Bileşeni
 * 
 * Props:
 * - items: array - [{id, title, description, date, icon?, color?, status?}]
 * - orientation: 'vertical' | 'horizontal'
 */
const Timeline = ({
    items = [],
    orientation = 'vertical',
    className = ''
}) => {
    const getStatusClass = (status) => {
        switch (status) {
            case 'completed': return 'status-completed'
            case 'current': return 'status-current'
            case 'upcoming': return 'status-upcoming'
            default: return ''
        }
    }

    const formatDate = (date) => {
        if (!date) return ''
        const d = new Date(date)
        return d.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className={`timeline ${orientation} ${className}`}>
            {items.map((item, index) => (
                <div
                    key={item.id || index}
                    className={`timeline-item ${getStatusClass(item.status)}`}
                >
                    {/* Connector Line */}
                    {index > 0 && (
                        <div className="timeline-connector" />
                    )}

                    {/* Dot */}
                    <div
                        className="timeline-dot"
                        style={{ borderColor: item.color }}
                    >
                        {item.icon || (
                            item.status === 'completed' ? '✓' :
                                item.status === 'current' ? '●' : '○'
                        )}
                    </div>

                    {/* Content */}
                    <div className="timeline-content">
                        <div className="timeline-header">
                            <h4 className="timeline-title">{item.title}</h4>
                            {item.date && (
                                <span className="timeline-date">
                                    {formatDate(item.date)}
                                </span>
                            )}
                        </div>

                        {item.description && (
                            <p className="timeline-description">
                                {item.description}
                            </p>
                        )}

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                            <div className="timeline-tags">
                                {item.tags.map((tag, i) => (
                                    <span key={i} className="timeline-tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Timeline
