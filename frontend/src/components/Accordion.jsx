import { useState } from 'react'

/**
 * Accordion Bileşeni
 * 
 * Props:
 * - items: array - [{id, title, content, icon?, disabled?}]
 * - allowMultiple: boolean - Birden fazla açık olabilir
 * - defaultOpen: array - Varsayılan açık item id'leri
 */
const Accordion = ({
    items = [],
    allowMultiple = false,
    defaultOpen = [],
    className = ''
}) => {
    const [openItems, setOpenItems] = useState(defaultOpen)

    const toggleItem = (itemId) => {
        if (allowMultiple) {
            setOpenItems(prev =>
                prev.includes(itemId)
                    ? prev.filter(id => id !== itemId)
                    : [...prev, itemId]
            )
        } else {
            setOpenItems(prev =>
                prev.includes(itemId) ? [] : [itemId]
            )
        }
    }

    const isOpen = (itemId) => openItems.includes(itemId)

    return (
        <div className={`accordion ${className}`}>
            {items.map(item => (
                <div
                    key={item.id}
                    className={`accordion-item ${isOpen(item.id) ? 'open' : ''} ${item.disabled ? 'disabled' : ''}`}
                >
                    {/* Header */}
                    <button
                        className="accordion-header"
                        onClick={() => !item.disabled && toggleItem(item.id)}
                        aria-expanded={isOpen(item.id)}
                        disabled={item.disabled}
                    >
                        {item.icon && (
                            <span className="accordion-icon">{item.icon}</span>
                        )}
                        <span className="accordion-title">{item.title}</span>
                        <span className={`accordion-arrow ${isOpen(item.id) ? 'open' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {/* Content */}
                    <div
                        className="accordion-content"
                        style={{
                            maxHeight: isOpen(item.id) ? '500px' : '0',
                            opacity: isOpen(item.id) ? 1 : 0
                        }}
                    >
                        <div className="accordion-body">
                            {item.content}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Accordion
