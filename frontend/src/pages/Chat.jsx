import { useState, useRef, useEffect, useCallback } from 'react'
import { chatWithAI } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

const Chat = () => {
    const { language } = useLanguage()

    // Conversation history state
    const [conversations, setConversations] = useState([
        { id: 1, title: 'Yeni Sohbet', timestamp: new Date().toISOString(), messages: [] }
    ])
    const [activeConversationId, setActiveConversationId] = useState(1)
    const [showHistory, setShowHistory] = useState(false)

    const getWelcomeMessage = useCallback(() => ({
        isUser: false,
        content: language === 'tr'
            ? `Merhaba! Ben CarbonTrace AI Asistanınızım. 👋<br><br>
               Mevzuat, emisyon hesaplama veya finansal konularda size nasıl yardımcı olabilirim?`
            : `Hello! I'm your CarbonTrace AI Assistant. 👋<br><br>
               How can I help you with regulations, emission calculations, or financial matters?`,
        suggestedActions: language === 'tr'
            ? ['Emisyon analizi yap', 'CBAM maliyetimi hesapla', 'Yeşil kredi önerisi ver']
            : ['Analyze emissions', 'Calculate my CBAM cost', 'Green loan suggestion']
    }), [language])

    const [messages, setMessages] = useState([getWelcomeMessage()])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (messages.length === 1 && !messages[0].isUser) {
            setMessages([getWelcomeMessage()])
        }
    }, [language, getWelcomeMessage, messages.length])

    const startNewConversation = () => {
        const newId = Date.now()
        const newConv = {
            id: newId,
            title: language === 'tr' ? 'Yeni Sohbet' : 'New Chat',
            timestamp: new Date().toISOString(),
            messages: []
        }
        setConversations(prev => [newConv, ...prev])
        setActiveConversationId(newId)
        setMessages([getWelcomeMessage()])
    }

    const loadConversation = (convId) => {
        const conv = conversations.find(c => c.id === convId)
        if (conv) {
            setActiveConversationId(convId)
            setMessages(conv.messages.length > 0 ? conv.messages : [getWelcomeMessage()])
            setShowHistory(false)
        }
    }

    const saveCurrentConversation = () => {
        setConversations(prev => prev.map(c =>
            c.id === activeConversationId
                ? { ...c, messages, title: messages[1]?.content?.slice(0, 30) + '...' || c.title }
                : c
        ))
    }

    const sendMessage = async (messageText) => {
        const text = messageText || input.trim()
        if (!text) return

        setMessages(prev => [...prev, { isUser: true, content: text }])
        setInput('')
        setIsLoading(true)

        try {
            const response = await chatWithAI(text)

            let content = response.message

            if (response.data) {
                content += '<br><br><strong>📊 ' + (language === 'tr' ? 'Detaylar' : 'Details') + ':</strong><br>'
                for (const [key, value] of Object.entries(response.data)) {
                    if (!Array.isArray(value)) {
                        content += `• <strong>${key}:</strong> ${typeof value === 'number' ? value.toLocaleString() : value} <br>`
                    }
                }
            }

            setMessages(prev => [...prev, {
                isUser: false,
                content,
                suggestedActions: response.suggested_actions?.map(a => a.label) || []
            }])

            // Auto-save after each response
            setTimeout(saveCurrentConversation, 100)

        } catch (error) {
            setMessages(prev => [...prev, {
                isUser: false,
                content: `${language === 'tr' ? 'Üzgünüm, bir hata oluştu' : 'Sorry, an error occurred'}: ${error.message}`
            }])
        }

        setIsLoading(false)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const handleActionClick = (action) => {
        sendMessage(action)
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return language === 'tr' ? 'Bugün' : 'Today'
        if (diffDays === 1) return language === 'tr' ? 'Dün' : 'Yesterday'
        return date.toLocaleDateString()
    }

    return (
        <div className="chat-page-container">
            {/* Conversation History Sidebar */}
            <div className={`chat-history-sidebar ${showHistory ? 'open' : ''}`}>
                <div className="history-header">
                    <h3>💬 {language === 'tr' ? 'Sohbet Geçmişi' : 'Chat History'}</h3>
                    <button className="btn btn-sm btn-primary" onClick={startNewConversation}>
                        ➕ {language === 'tr' ? 'Yeni' : 'New'}
                    </button>
                </div>
                <div className="history-list">
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            className={`history-item ${conv.id === activeConversationId ? 'active' : ''}`}
                            onClick={() => loadConversation(conv.id)}
                        >
                            <span className="history-icon">💬</span>
                            <div className="history-info">
                                <span className="history-title">{conv.title}</span>
                                <span className="history-time">{formatTime(conv.timestamp)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-container">
                <div className="chat-header">
                    <button
                        className="history-toggle"
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        📜
                    </button>
                    <div className="avatar">🤖</div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                            CBAM Guard AI {language === 'tr' ? 'Asistan' : 'Assistant'}
                        </h3>
                        <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                            {language === 'tr'
                                ? 'Emisyon, Maliyet ve Yeşil Finans Uzmanı'
                                : 'Emission, Cost & Green Finance Expert'}
                        </span>
                    </div>
                </div>

                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.isUser ? 'user' : 'ai'} fade-in`}>
                            <div className="message-avatar">
                                {message.isUser ? '👤' : '🤖'}
                            </div>
                            <div>
                                <div
                                    className="message-bubble"
                                    dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br/>') }}
                                />

                                {message.suggestedActions?.length > 0 && (
                                    <div className="suggested-actions">
                                        {message.suggestedActions.map((action, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleActionClick(action)}
                                                className="action-chip"
                                            >
                                                {action}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="message ai fade-in">
                            <div className="message-avatar">🤖</div>
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={language === 'tr'
                            ? 'Mesajınızı yazın... (örn: CBAM maliyetimi hesapla)'
                            : 'Type your message... (e.g., Calculate my CBAM cost)'}
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={isLoading || !input.trim()}
                        className="btn btn-primary"
                    >
                        <span>📤</span> {language === 'tr' ? 'Gönder' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Chat
