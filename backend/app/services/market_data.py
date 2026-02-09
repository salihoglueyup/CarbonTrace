import yfinance as yf
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class MarketDataService:
    def __init__(self):
        # KRBN: KraneShares Global Carbon Strategy ETF (Proxy for global carbon price)
        # KEUA: KraneShares European Carbon Allowance Strategy ETF (More specific to EU ETS)
        self.carbon_symbol = "KEUA"
        self.currency_symbol = "EURTRY=X"

    async def get_carbon_price(self):
        try:
            # Fetch data for the last 5 days to ensure we get the latest trading day
            ticker = yf.Ticker(self.carbon_symbol)
            history = ticker.history(period="5d")

            if history.empty:
                logger.warning("No carbon price data found, using fallback.")
                return {
                    "price": 90.0,
                    "currency": "EUR",
                    "date": datetime.now().isoformat(),
                }

            # Get the latest close price
            latest = history.iloc[-1]
            price = round(latest["Close"], 2)
            date = latest.name.isoformat()

            # Calculate daily change
            if len(history) >= 2:
                previous = history.iloc[-2]["Close"]
                change = round(((price - previous) / previous) * 100, 2)
            else:
                change = 0

            return {
                "price": price,
                "currency": "EUR",
                "change_percent": change,
                "date": date,
                "source": "Yahoo Finance (KEUA ETF)",
            }
        except Exception as e:
            logger.error(f"Error fetching carbon price: {str(e)}")
            # Fallback to static data if API fails
            return {
                "price": 85.50,
                "currency": "EUR",
                "change_percent": 0.0,
                "date": datetime.now().isoformat(),
                "is_fallback": True,
            }

    async def get_exchange_rates(self):
        try:
            ticker = yf.Ticker(self.currency_symbol)
            history = ticker.history(period="5d")

            if history.empty:
                return {"EUR_TRY": 35.0, "USD_TRY": 32.0}

            latest = history.iloc[-1]
            rate = round(latest["Close"], 4)

            # Get USD/TRY as well
            usd_ticker = yf.Ticker("TRY=X")  # This is usually USD/TRY
            usd_hist = usd_ticker.history(period="5d")
            usd_rate = (
                round(usd_hist.iloc[-1]["Close"], 4) if not usd_hist.empty else 32.0
            )

            return {
                "EUR_TRY": rate,
                "USD_TRY": usd_rate,
                "date": latest.name.isoformat(),
            }
        except Exception as e:
            logger.error(f"Error fetching exchange rates: {str(e)}")
            return {"EUR_TRY": 35.0, "USD_TRY": 32.0, "is_fallback": True}
