"""
Audit Log Service and Routes
Detailed activity tracking for compliance
"""

from fastapi import APIRouter, Query
from typing import Optional, List
from datetime import datetime, timedelta
from enum import Enum

router = APIRouter()


class AuditAction(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    VIEW = "view"
    EXPORT = "export"
    LOGIN = "login"
    LOGOUT = "logout"
    PERMISSION_CHANGE = "permission_change"


# In-memory audit log
audit_log_db = [
    {
        "id": 1,
        "user": "Ahmet Yılmaz",
        "user_id": 1,
        "action": "login",
        "target_type": "auth",
        "target_id": None,
        "target_name": "-",
        "ip": "192.168.1.100",
        "timestamp": "2024-01-19T14:00:00",
        "details": {"browser": "Chrome"},
    },
    {
        "id": 2,
        "user": "Ahmet Yılmaz",
        "user_id": 1,
        "action": "view",
        "target_type": "dashboard",
        "target_id": None,
        "target_name": "Dashboard",
        "ip": "192.168.1.100",
        "timestamp": "2024-01-19T14:01:00",
        "details": {},
    },
    {
        "id": 3,
        "user": "Ahmet Yılmaz",
        "user_id": 1,
        "action": "create",
        "target_type": "company",
        "target_id": 5,
        "target_name": "Akdeniz Kimya",
        "ip": "192.168.1.100",
        "timestamp": "2024-01-19T14:15:00",
        "details": {"sector": "Kimya"},
    },
    {
        "id": 4,
        "user": "Fatma Kaya",
        "user_id": 2,
        "action": "export",
        "target_type": "report",
        "target_id": 1,
        "target_name": "Q4 Emisyon Raporu",
        "ip": "192.168.1.101",
        "timestamp": "2024-01-19T14:30:00",
        "details": {"format": "PDF"},
    },
    {
        "id": 5,
        "user": "Ahmet Yılmaz",
        "user_id": 1,
        "action": "update",
        "target_type": "supplier",
        "target_id": 2,
        "target_name": "Balkan Steel Import",
        "ip": "192.168.1.100",
        "timestamp": "2024-01-19T14:45:00",
        "details": {"field": "risk_level", "old": "medium", "new": "high"},
    },
    {
        "id": 6,
        "user": "Sistem",
        "user_id": 0,
        "action": "create",
        "target_type": "backup",
        "target_id": None,
        "target_name": "Otomatik Yedekleme",
        "ip": "127.0.0.1",
        "timestamp": "2024-01-19T06:00:00",
        "details": {"size": "2.4 GB"},
    },
    {
        "id": 7,
        "user": "Mehmet Demir",
        "user_id": 3,
        "action": "permission_change",
        "target_type": "user",
        "target_id": 4,
        "target_name": "Ayşe Öztürk",
        "ip": "192.168.1.102",
        "timestamp": "2024-01-18T16:00:00",
        "details": {"old_role": "viewer", "new_role": "analyst"},
    },
]


def add_audit_log(
    user: str,
    user_id: int,
    action: str,
    target_type: str,
    target_id: Optional[int] = None,
    target_name: str = "",
    ip: str = "127.0.0.1",
    details: dict = None,
):
    """Add entry to audit log"""
    new_id = max(a["id"] for a in audit_log_db) + 1 if audit_log_db else 1

    audit_log_db.append(
        {
            "id": new_id,
            "user": user,
            "user_id": user_id,
            "action": action,
            "target_type": target_type,
            "target_id": target_id,
            "target_name": target_name,
            "ip": ip,
            "timestamp": datetime.now().isoformat(),
            "details": details or {},
        }
    )


@router.get("/")
async def get_audit_logs(
    user_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    target_type: Optional[str] = Query(None),
    days: int = Query(7),
    limit: int = Query(100),
):
    """Get audit logs with filters"""
    cutoff = datetime.now() - timedelta(days=days)

    results = audit_log_db

    # Apply filters
    if user_id:
        results = [a for a in results if a["user_id"] == user_id]
    if action:
        results = [a for a in results if a["action"] == action]
    if target_type:
        results = [a for a in results if a["target_type"] == target_type]

    # Filter by date
    results = [a for a in results if datetime.fromisoformat(a["timestamp"]) > cutoff]

    # Sort by timestamp desc
    results = sorted(results, key=lambda x: x["timestamp"], reverse=True)[:limit]

    return {"success": True, "logs": results, "total": len(results)}


@router.get("/summary")
async def get_audit_summary():
    """Get audit log summary/statistics"""
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)

    today_logs = [
        a for a in audit_log_db if datetime.fromisoformat(a["timestamp"]) > today_start
    ]
    week_logs = [
        a for a in audit_log_db if datetime.fromisoformat(a["timestamp"]) > week_start
    ]

    # Count by action
    action_counts = {}
    for log in week_logs:
        action = log["action"]
        action_counts[action] = action_counts.get(action, 0) + 1

    # Count by user
    user_counts = {}
    for log in week_logs:
        user = log["user"]
        user_counts[user] = user_counts.get(user, 0) + 1

    # Most active users
    top_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "success": True,
        "summary": {
            "today_count": len(today_logs),
            "week_count": len(week_logs),
            "total_count": len(audit_log_db),
            "action_breakdown": action_counts,
            "top_users": [{"user": u, "count": c} for u, c in top_users],
        },
    }


@router.get("/export")
async def export_audit_logs(days: int = Query(30), format: str = Query("json")):
    """Export audit logs for compliance"""
    cutoff = datetime.now() - timedelta(days=days)
    logs = [a for a in audit_log_db if datetime.fromisoformat(a["timestamp"]) > cutoff]

    return {
        "success": True,
        "export_date": datetime.now().isoformat(),
        "period_days": days,
        "total_records": len(logs),
        "logs": logs,
    }


@router.get("/user/{user_id}")
async def get_user_activity(user_id: int, days: int = Query(30)):
    """Get activity history for specific user"""
    cutoff = datetime.now() - timedelta(days=days)

    user_logs = [
        a
        for a in audit_log_db
        if a["user_id"] == user_id and datetime.fromisoformat(a["timestamp"]) > cutoff
    ]

    return {
        "success": True,
        "user_id": user_id,
        "activity_count": len(user_logs),
        "logs": sorted(user_logs, key=lambda x: x["timestamp"], reverse=True),
    }
