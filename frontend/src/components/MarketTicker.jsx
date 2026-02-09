import { useState, useEffect } from 'react'
import { marketAPI } from '../services/api'

const MarketTicker = () => {
    const [data, setData] = useState({
        carbon: { price: 0, change: 0 },
        currency: { eur_try: 0, usd_try: 0 }
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, these would be API calls
                // For now, we'll simulate the API response structure based on our backend
                const carbon = await marketAPI.getCarbonPrice()
                const currency = await marketAPI.getExchangeRates()

                setData({
                    carbon: {
                        price: carbon.price,
                        change: carbon.change_percent
                    },
                    currency: {
                        eur_try: currency.EUR_TRY,
                        usd_try: currency.USD_TRY
                    }
                })
            } catch (err) {
                console.error('Failed to fetch market data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        // Refresh every 5 minutes
        const interval = setInterval(fetchData, 300000)
        return () => clearInterval(interval)
    }, [])

    if (loading) return <div className="market-ticker-skeleton"></div>

    return (
        <div className="market-ticker-container">
            <div className="ticker-wrapper">
                <div className="ticker-item">
                    <span className="ticker-label">🇪🇺 EU ETS Carbon:</span>
                    <span className="ticker-value">€{data.carbon.price}</span>
                    <span className={`ticker-change ${data.carbon.change >= 0 ? 'positive' : 'negative'}`}>
                        {data.carbon.change >= 0 ? '▲' : '▼'} {Math.abs(data.carbon.change)}%
                    </span>
                </div>
                <div className="ticker-divider">|</div>
                <div className="ticker-item">
                    <span className="ticker-label">💶 EUR/TRY:</span>
                    <span className="ticker-value">₺{data.currency.eur_try}</span>
                </div>
                <div className="ticker-divider">|</div>
                <div className="ticker-item">
                    <span className="ticker-label">💵 USD/TRY:</span>
                    <span className="ticker-value">₺{data.currency.usd_try}</span>
                </div>
            </div>

            <style>{`
                .market-ticker-container {
                    background: #1a202c;
                    color: white;
                    padding: 8px 0;
                    overflow: hidden;
                    font-size: 0.9rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .ticker-wrapper {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    animation: ticker-slide 30s linear infinite; /* Optional: Make it scroll if content is long */
                }
                /* For stationary centered layout */
                .ticker-wrapper {
                    animation: none;
                    flex-wrap: wrap; 
                }
                .ticker-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .ticker-label {
                    color: #a0aec0;
                    font-weight: 500;
                }
                .ticker-value {
                    font-weight: 700;
                    color: #fff;
                }
                .ticker-change.positive { color: #48bb78; }
                .ticker-change.negative { color: #f56565; }
                .ticker-divider { color: #4a5568; }
                
                .market-ticker-skeleton {
                    height: 40px;
                    background: #1a202c;
                    width: 100%;
                }
            `}</style>
        </div>
    )
}

export default MarketTicker
