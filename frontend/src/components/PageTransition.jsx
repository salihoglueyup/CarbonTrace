import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// ============================================
// PAGE TRANSITION WRAPPER
// ============================================
export const PageTransition = ({ children, type = 'fade' }) => {
    const [isVisible, setIsVisible] = useState(false)
    const location = useLocation()

    useEffect(() => {
        setIsVisible(false)
        const timer = setTimeout(() => setIsVisible(true), 50)
        return () => clearTimeout(timer)
    }, [location.pathname])

    const getClassName = () => {
        const baseClass = 'page-transition'
        const typeClass = `page-transition-${type}`
        const visibleClass = isVisible ? 'visible' : ''
        return `${baseClass} ${typeClass} ${visibleClass}`
    }

    return (
        <div className={getClassName()}>
            {children}
        </div>
    )
}

// ============================================
// ANIMATED CONTAINER
// ============================================
export const AnimatedContainer = ({
    children,
    animation = 'fadeIn',
    delay = 0,
    duration = 300,
    trigger = true
}) => {
    const [isAnimated, setIsAnimated] = useState(false)

    useEffect(() => {
        if (trigger) {
            const timer = setTimeout(() => setIsAnimated(true), delay)
            return () => clearTimeout(timer)
        }
    }, [trigger, delay])

    return (
        <div
            className={`animated-container ${animation} ${isAnimated ? 'active' : ''}`}
            style={{
                '--animation-duration': `${duration}ms`,
                '--animation-delay': `${delay}ms`
            }}
        >
            {children}
        </div>
    )
}

// ============================================
// STAGGERED LIST
// ============================================
export const StaggeredList = ({
    children,
    staggerDelay = 50,
    animation = 'slideUp'
}) => {
    return (
        <div className="staggered-list">
            {Array.isArray(children) ? children.map((child, index) => (
                <AnimatedContainer
                    key={index}
                    animation={animation}
                    delay={index * staggerDelay}
                >
                    {child}
                </AnimatedContainer>
            )) : children}
        </div>
    )
}

// ============================================
// MORPH TRANSITION
// ============================================
export const MorphTransition = ({
    isOpen,
    children,
    direction = 'bottom'
}) => {
    return (
        <div className={`morph-transition morph-${direction} ${isOpen ? 'open' : ''}`}>
            {children}
        </div>
    )
}

export default { PageTransition, AnimatedContainer, StaggeredList, MorphTransition }
