import { useState, useId } from 'react'

/**
 * Premium Input Bileşeni
 * 
 * Props:
 * - label: string - Input etiketi
 * - type: string - Input tipi (text, email, password, number)
 * - value: string - Değer
 * - onChange: function - Değişim fonksiyonu
 * - error: string - Hata mesajı
 * - success: boolean - Başarı durumu
 * - helperText: string - Yardımcı metin
 * - icon: string - Sol ikon (emoji)
 * - iconRight: string - Sağ ikon
 * - maxLength: number - Maksimum karakter
 * - showCount: boolean - Karakter sayacı göster
 * - disabled: boolean
 * - required: boolean
 * - placeholder: string
 */
const Input = ({
    label,
    type = 'text',
    value = '',
    onChange,
    error,
    success,
    helperText,
    icon,
    iconRight,
    maxLength,
    showCount = false,
    disabled = false,
    required = false,
    placeholder,
    className = '',
    ...props
}) => {
    const [focused, setFocused] = useState(false)
    const inputId = useId()

    const hasValue = value && value.length > 0
    const isFloating = focused || hasValue || placeholder

    const getStateClass = () => {
        if (error) return 'input-error'
        if (success) return 'input-success'
        if (focused) return 'input-focused'
        return ''
    }

    return (
        <div className={`premium-input-wrapper ${className} ${disabled ? 'disabled' : ''}`}>
            <div className={`premium-input-container ${getStateClass()}`}>
                {/* Left Icon */}
                {icon && (
                    <span className="input-icon left">{icon}</span>
                )}

                {/* Input Field */}
                <div className="input-field-wrapper">
                    <input
                        id={inputId}
                        type={type}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        disabled={disabled}
                        required={required}
                        maxLength={maxLength}
                        placeholder={isFloating ? placeholder : ''}
                        className={`premium-input ${icon ? 'has-icon-left' : ''} ${iconRight ? 'has-icon-right' : ''}`}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                        {...props}
                    />

                    {/* Floating Label */}
                    {label && (
                        <label
                            htmlFor={inputId}
                            className={`floating-label ${isFloating ? 'floating' : ''}`}
                        >
                            {label}
                            {required && <span className="required-mark">*</span>}
                        </label>
                    )}
                </div>

                {/* Right Icon or Success/Error Icon */}
                {(iconRight || error || success) && (
                    <span className="input-icon right">
                        {error ? '⚠️' : success ? '✓' : iconRight}
                    </span>
                )}
            </div>

            {/* Helper Text / Error / Character Count */}
            <div className="input-footer">
                {(error || helperText) && (
                    <span
                        id={error ? `${inputId}-error` : `${inputId}-helper`}
                        className={`input-helper ${error ? 'error' : ''}`}
                    >
                        {error || helperText}
                    </span>
                )}

                {showCount && maxLength && (
                    <span className="input-count">
                        {value.length}/{maxLength}
                    </span>
                )}
            </div>
        </div>
    )
}

export default Input
