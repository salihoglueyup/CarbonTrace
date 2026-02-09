import sys
import os
import asyncio

# Ensure we can import 'app'
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from app.services.market_data import MarketDataService
from app.services.news_aggregator import NewsAggregatorService


async def test_services():
    print("Testing MarketDataService...")
    market_service = MarketDataService()
    try:
        price = await market_service.get_carbon_price()
        print(f"✅ Carbon Price: {price}")

        rates = await market_service.get_exchange_rates()
        print(f"✅ Exchange Rates: {rates}")
    except Exception as e:
        print(f"❌ MarketDataService Failed: {e}")
        import traceback

        traceback.print_exc()

    print("\nTesting NewsAggregatorService...")
    news_service = NewsAggregatorService()
    try:
        news = await news_service.get_latest_news(limit=2)
        print(f"✅ News ({len(news)} items):")
        for item in news:
            print(f" - {item['title']}")
    except Exception as e:
        print(f"❌ NewsAggregatorService Failed: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_services())
