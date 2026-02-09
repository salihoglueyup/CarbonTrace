/**
 * Stepper Bileşeni
 * 
 * Props:
 * - steps: array - [{id, title, description?, icon?}]
 * - currentStep: number (0-indexed)
 * - onChange: function(stepIndex)
 * - clickable: boolean - Adımlara tıklanabilir
 * - orientation: 'horizontal' | 'vertical'
 */
const Stepper = ({
    steps = [],
    currentStep = 0,
    onChange,
    clickable = false,
    orientation = 'horizontal',
    className = ''
}) => {
    const getStepStatus = (index) => {
        if (index < currentStep) return 'completed'
        if (index === currentStep) return 'current'
        return 'upcoming'
    }

    const handleStepClick = (index) => {
        if (clickable && onChange) {
            onChange(index)
        }
    }

    return (
        <div className={`stepper stepper-${orientation} ${className}`}>
            {steps.map((step, index) => (
                <div
                    key={step.id || index}
                    className={`stepper-item ${getStepStatus(index)} ${clickable ? 'clickable' : ''}`}
                    onClick={() => handleStepClick(index)}
                >
                    {/* Connector Line */}
                    {index > 0 && (
                        <div className={`stepper-connector ${index <= currentStep ? 'active' : ''}`} />
                    )}

                    {/* Step Circle */}
                    <div className="stepper-circle">
                        {getStepStatus(index) === 'completed' ? (
                            <span className="step-check">✓</span>
                        ) : step.icon ? (
                            <span className="step-icon">{step.icon}</span>
                        ) : (
                            <span className="step-number">{index + 1}</span>
                        )}
                    </div>

                    {/* Step Info */}
                    <div className="stepper-info">
                        <span className="stepper-title">{step.title}</span>
                        {step.description && (
                            <span className="stepper-description">{step.description}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Stepper
