import feedparser
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class NewsAggregatorService:
    def __init__(self):
        self.sources = [
            {
                "name": "Euractiv - Energy & Environment",
                "url": "https://www.euractiv.com/section/energy-environment/feed/",
            },
            {
                "name": "Reuters - Environment",
                "url": "https://www.reutersagency.com/feed/?best-topics=environment&post_type=best",
            },
            {
                "name": "Carbon Pulse (Public)",
                "url": "https://carbon-pulse.com/category/eu-ets/feed/",
            },
        ]

    async def get_latest_news(self, limit=10):
        all_news = []

        for source in self.sources:
            try:
                feed = feedparser.parse(source["url"])

                for entry in feed.entries[:5]:  # Take top 5 from each
                    # Filter for relevant keywords to ensure relevance
                    keywords = [
                        "carbon",
                        "cbam",
                        "emission",
                        "climate",
                        "green deal",
                        "eu ets",
                    ]
                    title_lower = entry.title.lower()
                    summary_lower = (
                        entry.summary.lower() if hasattr(entry, "summary") else ""
                    )

                    if any(k in title_lower or k in summary_lower for k in keywords):
                        # Extract image if available
                        image_url = None
                        if "media_content" in entry:
                            image_url = entry.media_content[0]["url"]
                        elif "links" in entry:
                            for link in entry.links:
                                if link.type.startswith("image/"):
                                    image_url = link.href
                                    break

                        all_news.append(
                            {
                                "title": entry.title,
                                "link": entry.link,
                                "published": (
                                    entry.published
                                    if hasattr(entry, "published")
                                    else datetime.now().isoformat()
                                ),
                                "source": source["name"],
                                "summary": (
                                    entry.summary if hasattr(entry, "summary") else ""
                                ),
                                "image": image_url,
                            }
                        )
            except Exception as e:
                logger.error(f"Error parsing feed {source['url']}: {str(e)}")
                continue

        # Sort by date (newest first)
        # Note: Parsing date strings can be tricky, for simplicity we might just return the list as is or do basic sort
        # A robust implementation would parse dates into datetime objects

        return all_news[:limit]
