"""
Security Service
Session management, IP whitelist, login attempts, security alerts
"""

from fastapi import APIRouter, HTTPException, Request, Query
from typing import Optional, List, Dict
from datetime import datetime, timedelta
from pydantic import BaseModel
import hashlib

router = APIRouter()


class SecuritySettings(BaseModel):
    two_factor_enabled: bool = False
    session_timeout_minutes: int = 30
    max_login_attempts: int = 5
    ip_whitelist_enabled: bool = False
    ip_whitelist: List[str] = []


# In-memory storage
sessions_db: Dict[str, dict] = {}
login_attempts_db: Dict[str, list] = {}
ip_whitelist_db: List[str] = ["192.168.1.*", "10.0.0.*"]
security_alerts_db: List[dict] = [
    {
        "id": 1,
        "type": "suspicious_login",
        "severity": "high",
        "message": "Bilinmeyen IP'den giriş denemesi",
        "ip": "185.234.72.15",
        "timestamp": "2024-01-19T10:30:00",
        "resolved": False,
    },
    {
        "id": 2,
        "type": "multiple_failures",
        "severity": "medium",
        "message": "5 başarısız giriş denemesi",
        "ip": "192.168.1.105",
        "timestamp": "2024-01-18T16:45:00",
        "resolved": True,
    },
]


def generate_session_id(user_id: int) -> str:
    """Generate a secure session ID"""
    import secrets

    return secrets.token_urlsafe(32)


def check_ip_allowed(ip: str) -> bool:
    """Check if IP is in whitelist"""
    for pattern in ip_whitelist_db:
        if pattern.endswith("*"):
            if ip.startswith(pattern[:-1]):
                return True
        elif ip == pattern:
            return True
    return True  # Default allow if whitelist is empty


def record_login_attempt(ip: str, success: bool, user_id: Optional[int] = None):
    """Record login attempt"""
    if ip not in login_attempts_db:
        login_attempts_db[ip] = []

    login_attempts_db[ip].append(
        {
            "timestamp": datetime.now().isoformat(),
            "success": success,
            "user_id": user_id,
        }
    )

    # Keep only last 100 attempts per IP
    login_attempts_db[ip] = login_attempts_db[ip][-100:]

    # Check for suspicious activity
    recent_failures = [
        a
        for a in login_attempts_db[ip][-10:]
        if not a["success"]
        and datetime.fromisoformat(a["timestamp"])
        > datetime.now() - timedelta(minutes=30)
    ]

    if len(recent_failures) >= 5:
        security_alerts_db.append(
            {
                "id": len(security_alerts_db) + 1,
                "type": "multiple_failures",
                "severity": "medium",
                "message": f"{len(recent_failures)} başarısız giriş denemesi",
                "ip": ip,
                "timestamp": datetime.now().isoformat(),
                "resolved": False,
            }
        )


@router.get("/sessions")
async def get_active_sessions(user_id: Optional[int] = Query(None)):
    """Get active sessions"""
    sessions = list(sessions_db.values())

    if user_id:
        sessions = [s for s in sessions if s.get("user_id") == user_id]

    return {"success": True, "sessions": sessions, "total": len(sessions)}


@router.delete("/sessions/{session_id}")
async def terminate_session(session_id: str):
    """Terminate a specific session"""
    if session_id in sessions_db:
        del sessions_db[session_id]
        return {"success": True, "message": "Session terminated"}
    raise HTTPException(status_code=404, detail="Session not found")


@router.post("/sessions/terminate-all")
async def terminate_all_sessions(user_id: int):
    """Terminate all sessions for a user"""
    global sessions_db
    terminated = 0
    for sid in list(sessions_db.keys()):
        if sessions_db[sid].get("user_id") == user_id:
            del sessions_db[sid]
            terminated += 1

    return {"success": True, "terminated_count": terminated}


@router.get("/login-attempts")
async def get_login_attempts(ip: Optional[str] = Query(None)):
    """Get login attempt history"""
    if ip:
        attempts = login_attempts_db.get(ip, [])
        return {"success": True, "ip": ip, "attempts": attempts}

    # Aggregate stats
    total_attempts = sum(len(a) for a in login_attempts_db.values())
    failed_attempts = sum(
        len([x for x in a if not x["success"]]) for a in login_attempts_db.values()
    )

    return {
        "success": True,
        "total_ips": len(login_attempts_db),
        "total_attempts": total_attempts,
        "failed_attempts": failed_attempts,
        "success_rate": (
            f"{((total_attempts - failed_attempts) / total_attempts * 100):.1f}%"
            if total_attempts > 0
            else "N/A"
        ),
    }


@router.get("/ip-whitelist")
async def get_ip_whitelist():
    """Get IP whitelist"""
    return {
        "success": True,
        "whitelist": ip_whitelist_db,
        "enabled": len(ip_whitelist_db) > 0,
    }


@router.post("/ip-whitelist")
async def add_to_whitelist(ip: str):
    """Add IP to whitelist"""
    if ip not in ip_whitelist_db:
        ip_whitelist_db.append(ip)
    return {"success": True, "whitelist": ip_whitelist_db}


@router.delete("/ip-whitelist/{ip}")
async def remove_from_whitelist(ip: str):
    """Remove IP from whitelist"""
    if ip in ip_whitelist_db:
        ip_whitelist_db.remove(ip)
    return {"success": True, "whitelist": ip_whitelist_db}


@router.get("/alerts")
async def get_security_alerts(unresolved_only: bool = Query(False)):
    """Get security alerts"""
    alerts = security_alerts_db

    if unresolved_only:
        alerts = [a for a in alerts if not a.get("resolved")]

    return {
        "success": True,
        "alerts": sorted(alerts, key=lambda x: x["timestamp"], reverse=True),
        "unresolved_count": len(
            [a for a in security_alerts_db if not a.get("resolved")]
        ),
    }


@router.put("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: int):
    """Mark security alert as resolved"""
    for alert in security_alerts_db:
        if alert["id"] == alert_id:
            alert["resolved"] = True
            alert["resolved_at"] = datetime.now().isoformat()
            return {"success": True}
    raise HTTPException(status_code=404, detail="Alert not found")


@router.get("/settings")
async def get_security_settings():
    """Get security settings"""
    return {
        "success": True,
        "settings": {
            "two_factor_enabled": False,
            "session_timeout_minutes": 30,
            "max_login_attempts": 5,
            "ip_whitelist_enabled": len(ip_whitelist_db) > 0,
            "password_policy": {
                "min_length": 8,
                "require_uppercase": True,
                "require_number": True,
                "require_special": False,
            },
        },
    }
