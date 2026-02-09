"""
Performance Monitoring API
API metrics, error tracking, system health
"""

from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime, timedelta
import random

router = APIRouter()


# Mock performance data
def generate_mock_metrics():
    """Generate mock performance metrics"""
    return {
        "api_response_times": {
            "avg_ms": random.randint(50, 150),
            "p95_ms": random.randint(150, 300),
            "p99_ms": random.randint(300, 500),
        },
        "requests_per_minute": random.randint(100, 500),
        "error_rate": round(random.uniform(0.1, 2.0), 2),
        "active_connections": random.randint(10, 50),
        "memory_usage_mb": random.randint(200, 500),
        "cpu_usage_percent": random.randint(10, 60),
    }


error_log_db = [
    {
        "id": 1,
        "type": "APIError",
        "message": "Database connection timeout",
        "endpoint": "/api/companies",
        "status_code": 500,
        "timestamp": "2024-01-19T10:15:00",
        "count": 3,
    },
    {
        "id": 2,
        "type": "ValidationError",
        "message": "Invalid emission value",
        "endpoint": "/api/emissions",
        "status_code": 400,
        "timestamp": "2024-01-19T09:30:00",
        "count": 7,
    },
    {
        "id": 3,
        "type": "AuthError",
        "message": "Token expired",
        "endpoint": "/api/auth/refresh",
        "status_code": 401,
        "timestamp": "2024-01-18T16:45:00",
        "count": 12,
    },
]


@router.get("/metrics")
async def get_performance_metrics():
    """Get current performance metrics"""
    metrics = generate_mock_metrics()

    return {
        "success": True,
        "metrics": metrics,
        "timestamp": datetime.now().isoformat(),
        "status": "healthy" if metrics["error_rate"] < 5 else "degraded",
    }


@router.get("/metrics/history")
async def get_metrics_history(hours: int = Query(24)):
    """Get historical performance metrics"""
    history = []
    now = datetime.now()

    for i in range(hours):
        timestamp = now - timedelta(hours=i)
        history.append(
            {
                "timestamp": timestamp.isoformat(),
                "avg_response_ms": random.randint(50, 150),
                "requests_per_minute": random.randint(100, 500),
                "error_rate": round(random.uniform(0.1, 2.0), 2),
            }
        )

    return {"success": True, "history": list(reversed(history))}


@router.get("/errors")
async def get_error_log(
    hours: int = Query(24), error_type: Optional[str] = Query(None)
):
    """Get error log"""
    errors = error_log_db

    if error_type:
        errors = [e for e in errors if e["type"] == error_type]

    return {
        "success": True,
        "errors": errors,
        "total_errors": sum(e["count"] for e in errors),
        "error_types": list(set(e["type"] for e in error_log_db)),
    }


@router.get("/health")
async def get_system_health():
    """Get system health status"""
    metrics = generate_mock_metrics()

    # Determine health status
    issues = []
    status = "healthy"

    if metrics["cpu_usage_percent"] > 80:
        issues.append("High CPU usage")
        status = "warning"
    if metrics["memory_usage_mb"] > 400:
        issues.append("High memory usage")
        status = "warning"
    if metrics["error_rate"] > 5:
        issues.append("High error rate")
        status = "critical"
    if metrics["api_response_times"]["avg_ms"] > 200:
        issues.append("Slow API response")
        status = "warning"

    return {
        "success": True,
        "status": status,
        "issues": issues,
        "components": {
            "api": {
                "status": "healthy",
                "latency_ms": metrics["api_response_times"]["avg_ms"],
            },
            "database": {"status": "healthy", "connections": random.randint(5, 20)},
            "cache": {"status": "healthy", "hit_rate": f"{random.randint(85, 99)}%"},
            "ai_service": {
                "status": "healthy" if random.random() > 0.1 else "degraded",
                "model": "gpt-4o-mini",
            },
        },
        "uptime": "14d 6h 32m",
        "last_check": datetime.now().isoformat(),
    }


@router.get("/analytics")
async def get_user_analytics():
    """Get user analytics"""
    return {
        "success": True,
        "analytics": {
            "daily_active_users": random.randint(50, 150),
            "weekly_active_users": random.randint(200, 400),
            "monthly_active_users": random.randint(500, 1000),
            "avg_session_duration_min": random.randint(10, 30),
            "pages_per_session": round(random.uniform(4, 12), 1),
            "top_pages": [
                {"page": "/dashboard", "views": 1250},
                {"page": "/emissions", "views": 890},
                {"page": "/cbam", "views": 720},
                {"page": "/chat", "views": 650},
                {"page": "/reports", "views": 480},
            ],
            "user_growth": {"this_month": 45, "last_month": 38, "growth_rate": "18.4%"},
        },
    }


@router.get("/dashboard")
async def get_monitoring_dashboard():
    """Get all monitoring data for dashboard"""
    metrics = generate_mock_metrics()

    return {
        "success": True,
        "overview": {
            "status": "healthy",
            "uptime": "99.9%",
            "total_requests_today": random.randint(10000, 50000),
            "avg_response_time": f"{metrics['api_response_times']['avg_ms']}ms",
            "error_rate": f"{metrics['error_rate']}%",
        },
        "alerts": [
            a
            for a in [
                {
                    "type": "info",
                    "message": "Yeni versiyon deploy edildi",
                    "time": "2 saat önce",
                },
            ]
        ],
        "recent_errors": error_log_db[:3],
        "metrics": metrics,
    }
