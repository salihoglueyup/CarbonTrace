import { createContext, useContext, useState, useEffect } from 'react'
import trTranslations from '../i18n/tr.json'
import enTranslations from '../i18n/en.json'

const LanguageContext = createContext()

const translations = {
    tr: trTranslations,
    en: enTranslations
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('language')
        if (saved && translations[saved]) return saved

        // Check browser language
        const browserLang = navigator.language.split('-')[0]
        if (translations[browserLang]) return browserLang

        return 'tr' // Default to Turkish
    })

    useEffect(() => {
        localStorage.setItem('language', language)
        document.documentElement.setAttribute('lang', language)
    }, [language])

    // Translation function
    const t = (key, fallback = '') => {
        const keys = key.split('.')
        let value = translations[language]

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k]
            } else {
                return fallback || key
            }
        }

        return typeof value === 'string' ? value : (fallback || key)
    }

    const changeLanguage = (lang) => {
        if (translations[lang]) {
            setLanguage(lang)
        }
    }

    const availableLanguages = [
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
        { code: 'en', name: 'English', flag: '🇬🇧' }
    ]

    const value = {
        language,
        setLanguage: changeLanguage,
        t,
        availableLanguages,
        isRTL: false // Turkish and English are LTR
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

export default LanguageContext
