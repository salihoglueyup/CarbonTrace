import React from 'react'
import '../skeleton.css'

/**
 * Skeleton Loading Component
 * Kullanım: <Skeleton type="text|avatar|button|card|table" />
 */
const Skeleton = ({ type = 'text', count = 1, width, height, className = '' }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'avatar':
                return <div className={`skeleton skeleton-avatar ${className}`} />

            case 'button':
                return <div className={`skeleton skeleton-button ${className}`} style={{ width, height }} />

            case 'card':
                return (
                    <div className={`skeleton-card ${className}`}>
                        <div className="skeleton skeleton-header" />
                        <div className="skeleton skeleton-text" />
                        <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                    </div>
                )

            case 'table':
                return (
                    <div className={`skeleton-table ${className}`}>
                        <div className="skeleton skeleton-table-header" />
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="skeleton skeleton-table-row" />
                        ))}
                    </div>
                )

            case 'chart':
                return <div className={`skeleton skeleton-chart ${className}`} />

            case 'text':
            default:
                return <div className={`skeleton skeleton-text ${className}`} style={{ width, height }} />
        }
    }

    return (
        <>
            {[...Array(count)].map((_, i) => (
                <React.Fragment key={i}>
                    {renderSkeleton()}
                </React.Fragment>
            ))}
        </>
    )
}

export default Skeleton
