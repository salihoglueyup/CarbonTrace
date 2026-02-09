"""
AI Recommendations API Routes
"""

from fastapi import APIRouter, Query
from typing import Optional, List
from app.services.recommendation_engine import recommendation_engine

router = APIRouter()


@router.get("/personalized")
async def get_personalized_recommendations(user_id: int = Query(1)):
    """Get personalized recommendations for user"""
    recommendations = recommendation_engine.get_personalized_recommendations(user_id)

    # Add some default recommendations if none found
    if not recommendations:
        recommendations = [
            {
                "id": "default_1",
                "type": "tip",
                "title": "Haftalık Rapor",
                "description": "Bu hafta 3 yeni özellik eklendi. Keşfetmek için tıklayın.",
                "action": "Keşfet",
                "action_url": "/settings",
                "priority": "low",
                "icon": "💡",
            },
            {
                "id": "default_2",
                "type": "reminder",
                "title": "Hedging Fırsatı",
                "description": "Karbon fiyatları son 7 günde %3 düştü. Hedging stratejinizi gözden geçirin.",
                "action": "Hedging'e Git",
                "action_url": "/hedging",
                "priority": "medium",
                "icon": "📈",
            },
        ]

    return {"success": True, "recommendations": recommendations, "generated_at": "now"}


@router.get("/insights")
async def get_emission_insights():
    """Get AI-generated insights about emissions"""
    # Mock emission data
    mock_data = [
        {"date": "2024-01", "value": 4500},
        {"date": "2024-02", "value": 4700},
        {"date": "2024-03", "value": 4600},
        {"date": "2024-04", "value": 4900},
        {"date": "2024-05", "value": 5100},
        {"date": "2024-06", "value": 4800},
    ]

    insights = recommendation_engine.get_emission_insights(mock_data)

    return {"success": True, "insights": insights}


@router.get("/anomalies")
async def detect_anomalies():
    """Detect anomalies in emission data"""
    # Mock data with anomaly
    mock_data = [
        {"date": "2024-01", "value": 4500},
        {"date": "2024-02", "value": 4700},
        {"date": "2024-03", "value": 4600},
        {"date": "2024-04", "value": 8500},  # Anomaly!
        {"date": "2024-05", "value": 4800},
        {"date": "2024-06", "value": 4700},
    ]

    anomalies = recommendation_engine.detect_anomalies(mock_data)

    return {
        "success": True,
        "anomalies": anomalies,
        "total_data_points": len(mock_data),
        "anomaly_count": len(anomalies),
    }


@router.get("/action-items")
async def get_action_items():
    """Get prioritized action items"""
    mock_company = {"total_emissions": 61000, "risk_score": 75}

    actions = recommendation_engine.generate_action_items(mock_company)

    return {"success": True, "action_items": actions}


@router.post("/track")
async def track_user_action(user_id: int, action: str, target: str):
    """Track user action for recommendation learning"""
    recommendation_engine.track_action(user_id, action, target)

    return {"success": True, "message": "Action tracked"}
