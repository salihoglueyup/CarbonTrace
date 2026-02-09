/**
 * Toggle/Switch Bileşeni
 * 
 * Props:
 * - checked: boolean
 * - onChange: function
 * - label: string
 * - labelPosition: 'left' | 'right'
 * - size: 'sm' | 'md' | 'lg'
 * - disabled: boolean
 * - color: string
 */
const Toggle = ({
    checked = false,
    onChange,
    label,
    labelPosition = 'right',
    size = 'md',
    disabled = false,
    color = 'var(--bbva-green)',
    className = ''
}) => {
    const handleClick = () => {
        if (!disabled && onChange) {
            onChange(!checked)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
        }
    }

    return (
        <div
            className={`toggle-wrapper ${labelPosition} ${className} ${disabled ? 'disabled' : ''}`}
            onClick={handleClick}
        >
            {label && labelPosition === 'left' && (
                <span className="toggle-label">{label}</span>
            )}

            <div
                className={`toggle toggle-${size} ${checked ? 'checked' : ''}`}
                role="switch"
                aria-checked={checked}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={handleKeyDown}
                style={{ '--toggle-color': color }}
            >
                <div className="toggle-track" />
                <div className="toggle-thumb" />
            </div>

            {label && labelPosition === 'right' && (
                <span className="toggle-label">{label}</span>
            )}
        </div>
    )
}

export default Toggle
