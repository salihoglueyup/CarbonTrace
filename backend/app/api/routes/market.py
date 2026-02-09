from fastapi import APIRouter, Depends, HTTPException
from app.services.market_data import MarketDataService
from app.services.news_aggregator import NewsAggregatorService

router = APIRouter()
market_service = MarketDataService()
news_service = NewsAggregatorService()


@router.get("/carbon-price")
async def get_carbon_price():
    """
    Get the latest Carbon Price (EU ETS Proxy).
    """
    return await market_service.get_carbon_price()


@router.get("/exchange-rates")
async def get_exchange_rates():
    """
    Get the latest EUR/TRY and USD/TRY exchange rates.
    """
    return await market_service.get_exchange_rates()


@router.get("/news")
async def get_news(limit: int = 10):
    """
    Get the latest news related to CBAM and Carbon Markets.
    """
    return await news_service.get_latest_news(limit)
