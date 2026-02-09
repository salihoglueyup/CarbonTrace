import { useState } from 'react'

/**
 * Tabs Bileşeni
 * 
 * Props:
 * - tabs: array - [{id, label, icon?, content, disabled?}]
 * - defaultTab: string - Varsayılan aktif tab id
 * - onChange: function(tabId)
 * - variant: 'default' | 'pills' | 'underline'
 */
const Tabs = ({
    tabs = [],
    defaultTab,
    onChange,
    variant = 'default',
    className = ''
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

    const handleTabClick = (tabId, disabled) => {
        if (disabled) return
        setActiveTab(tabId)
        onChange?.(tabId)
    }

    const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content

    return (
        <div className={`tabs-container ${className}`}>
            {/* Tab Headers */}
            <div className={`tabs-header tabs-${variant}`} role="tablist">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
                        onClick={() => handleTabClick(tab.id, tab.disabled)}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-disabled={tab.disabled}
                        tabIndex={tab.disabled ? -1 : 0}
                    >
                        {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}

                {/* Animated Indicator (for underline variant) */}
                {variant === 'underline' && (
                    <div
                        className="tab-indicator"
                        style={{
                            width: `${100 / tabs.length}%`,
                            left: `${(tabs.findIndex(t => t.id === activeTab) / tabs.length) * 100}%`
                        }}
                    />
                )}
            </div>

            {/* Tab Content */}
            <div className="tabs-content" role="tabpanel">
                {activeTabContent}
            </div>
        </div>
    )
}

export default Tabs
