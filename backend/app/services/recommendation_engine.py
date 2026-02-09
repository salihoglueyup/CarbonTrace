"""
AI Recommendation Engine
Smart suggestions based on user behavior and emission data
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random


class RecommendationEngine:
    """AI-powered recommendation engine for CBAM Guard"""

    def __init__(self):
        self.user_actions = []  # Track user actions for personalization
        self.emission_thresholds = {"high": 100000, "medium": 50000, "low": 10000}

    def track_action(
        self, user_id: int, action: str, target: str, metadata: dict = None
    ):
        """Track user action for learning"""
        self.user_actions.append(
            {
                "user_id": user_id,
                "action": action,
                "target": target,
                "metadata": metadata or {},
                "timestamp": datetime.now().isoformat(),
            }
        )

    def get_personalized_recommendations(
        self, user_id: int, context: dict = None
    ) -> List[Dict]:
        """Get personalized recommendations based on user behavior"""
        recommendations = []

        # Check recent actions
        user_recent_actions = [a for a in self.user_actions if a["user_id"] == user_id][
            -10:
        ]

        # If user frequently views emissions, suggest optimization
        emission_views = len(
            [a for a in user_recent_actions if "emission" in a["target"].lower()]
        )
        if emission_views >= 3:
            recommendations.append(
                {
                    "id": "opt_1",
                    "type": "optimization",
                    "title": "Emisyon Azaltım Fırsatı",
                    "description": "Scope 1 emisyonlarınızda %15 azaltım potansiyeli tespit edildi.",
                    "action": "Detayları Gör",
                    "action_url": "/scenarios",
                    "priority": "high",
                    "icon": "🌿",
                }
            )

        # If user hasn't checked compliance recently
        compliance_views = len(
            [a for a in user_recent_actions if "compliance" in a["target"].lower()]
        )
        if compliance_views == 0:
            recommendations.append(
                {
                    "id": "comp_1",
                    "type": "reminder",
                    "title": "Uyumluluk Kontrolü",
                    "description": "CBAM uyumluluk durumunuzu kontrol etmeniz önerilir.",
                    "action": "Kontrol Et",
                    "action_url": "/compliance",
                    "priority": "medium",
                    "icon": "✅",
                }
            )

        return recommendations

    def get_emission_insights(self, emissions_data: List[Dict]) -> List[Dict]:
        """Analyze emissions and provide insights"""
        insights = []

        if not emissions_data:
            return insights

        total_emissions = sum(e.get("value", 0) for e in emissions_data)

        # High emission alert
        if total_emissions > self.emission_thresholds["high"]:
            insights.append(
                {
                    "type": "alert",
                    "severity": "high",
                    "title": "Yüksek Emisyon Uyarısı",
                    "message": f"Toplam emisyonunuz ({total_emissions:,.0f} tCO2e) kritik seviyenin üzerinde.",
                    "suggestion": "Acil azaltım planı oluşturmanız önerilir.",
                }
            )

        # Trend analysis (mock)
        insights.append(
            {
                "type": "trend",
                "direction": "up",
                "percentage": 5.2,
                "title": "Aylık Trend",
                "message": "Emisyonlarınız geçen aya göre %5.2 arttı.",
                "suggestion": "Enerji verimliliği projelerini değerlendirin.",
            }
        )

        return insights

    def detect_anomalies(self, data: List[Dict], field: str = "value") -> List[Dict]:
        """Detect anomalies in time series data"""
        anomalies = []

        if len(data) < 5:
            return anomalies

        values = [d.get(field, 0) for d in data]
        avg = sum(values) / len(values)
        std_dev = (sum((x - avg) ** 2 for x in values) / len(values)) ** 0.5

        for i, item in enumerate(data):
            value = item.get(field, 0)
            z_score = (value - avg) / std_dev if std_dev > 0 else 0

            if abs(z_score) > 2:  # More than 2 standard deviations
                anomalies.append(
                    {
                        "index": i,
                        "value": value,
                        "expected_range": f"{avg - 2*std_dev:.0f} - {avg + 2*std_dev:.0f}",
                        "z_score": z_score,
                        "type": "spike" if z_score > 0 else "drop",
                        "severity": "high" if abs(z_score) > 3 else "medium",
                        "date": item.get("date", "Unknown"),
                    }
                )

        return anomalies

    def generate_action_items(self, company_data: Dict) -> List[Dict]:
        """Generate prioritized action items"""
        actions = []

        emissions = company_data.get("total_emissions", 0)
        risk_score = company_data.get("risk_score", 50)

        if risk_score > 70:
            actions.append(
                {
                    "priority": 1,
                    "title": "Risk Azaltma Planı",
                    "description": "Yüksek risk skoru için acil eylem gerekiyor.",
                    "category": "risk",
                    "estimated_impact": "Yüksek",
                    "deadline": (datetime.now() + timedelta(days=30)).strftime(
                        "%Y-%m-%d"
                    ),
                }
            )

        if emissions > 50000:
            actions.append(
                {
                    "priority": 2,
                    "title": "Emisyon Azaltım Projesi",
                    "description": "Scope 1 emisyonları için yenilenebilir enerji değerlendirmesi.",
                    "category": "emission",
                    "estimated_impact": "€500K/yıl tasarruf",
                    "deadline": (datetime.now() + timedelta(days=90)).strftime(
                        "%Y-%m-%d"
                    ),
                }
            )

        actions.append(
            {
                "priority": 3,
                "title": "Tedarikçi CBAM Hazırlığı",
                "description": "Tedarikçilerden emisyon verileri toplayın.",
                "category": "compliance",
                "estimated_impact": "Orta",
                "deadline": (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d"),
            }
        )

        return sorted(actions, key=lambda x: x["priority"])


# Global instance
recommendation_engine = RecommendationEngine()
