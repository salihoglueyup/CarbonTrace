import { useState } from 'react'

/**
 * Kanban Board Bileşeni
 * 
 * Props:
 * - columns: array - [{id, title, color}]
 * - cards: array - [{id, title, description, columnId, priority?, assignee?, dueDate?}]
 * - onCardMove: function(cardId, newColumnId)
 * - onCardClick: function(card)
 * - onAddCard: function(columnId)
 */
const KanbanBoard = ({
    columns = [],
    cards = [],
    onCardMove,
    onCardClick,
    onAddCard,
    className = ''
}) => {
    const [draggedCard, setDraggedCard] = useState(null)
    const [dragOverColumn, setDragOverColumn] = useState(null)

    const getCardsForColumn = (columnId) => {
        return cards.filter(card => card.columnId === columnId)
    }

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'high': return 'priority-high'
            case 'medium': return 'priority-medium'
            case 'low': return 'priority-low'
            default: return ''
        }
    }

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'high': return '🔴 Yüksek'
            case 'medium': return '🟡 Orta'
            case 'low': return '🟢 Düşük'
            default: return ''
        }
    }

    // Drag handlers
    const handleDragStart = (e, card) => {
        setDraggedCard(card)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e, columnId) => {
        e.preventDefault()
        setDragOverColumn(columnId)
    }

    const handleDragLeave = () => {
        setDragOverColumn(null)
    }

    const handleDrop = (e, columnId) => {
        e.preventDefault()
        if (draggedCard && draggedCard.columnId !== columnId) {
            onCardMove?.(draggedCard.id, columnId)
        }
        setDraggedCard(null)
        setDragOverColumn(null)
    }

    const handleDragEnd = () => {
        setDraggedCard(null)
        setDragOverColumn(null)
    }

    return (
        <div className={`kanban-board ${className}`}>
            {columns.map(column => (
                <div
                    key={column.id}
                    className={`kanban-column ${dragOverColumn === column.id ? 'drag-over' : ''}`}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    {/* Column Header */}
                    <div className="kanban-column-header">
                        <div className="column-title">
                            <span
                                className="column-dot"
                                style={{ background: column.color }}
                            />
                            <h4>{column.title}</h4>
                            <span className="column-count">
                                {getCardsForColumn(column.id).length}
                            </span>
                        </div>
                        {onAddCard && (
                            <button
                                className="column-add-btn"
                                onClick={() => onAddCard(column.id)}
                            >
                                +
                            </button>
                        )}
                    </div>

                    {/* Cards */}
                    <div className="kanban-cards">
                        {getCardsForColumn(column.id).map(card => (
                            <div
                                key={card.id}
                                className={`kanban-card ${draggedCard?.id === card.id ? 'dragging' : ''} ${getPriorityClass(card.priority)}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, card)}
                                onDragEnd={handleDragEnd}
                                onClick={() => onCardClick?.(card)}
                            >
                                {/* Priority Badge */}
                                {card.priority && (
                                    <span className="card-priority">
                                        {getPriorityLabel(card.priority)}
                                    </span>
                                )}

                                {/* Title */}
                                <h5 className="card-title">{card.title}</h5>

                                {/* Description */}
                                {card.description && (
                                    <p className="card-description">{card.description}</p>
                                )}

                                {/* Footer */}
                                <div className="card-footer">
                                    {card.assignee && (
                                        <div className="card-assignee" title={card.assignee}>
                                            {card.assignee.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {card.dueDate && (
                                        <span className="card-due">
                                            📅 {new Date(card.dueDate).toLocaleDateString('tr-TR')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Empty State */}
                        {getCardsForColumn(column.id).length === 0 && (
                            <div className="kanban-empty">
                                Kart yok
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default KanbanBoard
