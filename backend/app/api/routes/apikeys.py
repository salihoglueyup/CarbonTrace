"""
API Key Management Routes
User can manage their own API keys
"""

from fastapi import APIRouter, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
import secrets
import hashlib

router = APIRouter()


class APIKeyCreate(BaseModel):
    name: str
    permissions: List[str] = ["read"]
    expires_days: Optional[int] = 365


class APIKeyUpdate(BaseModel):
    name: Optional[str] = None
    active: Optional[bool] = None


# In-memory storage (use database in production)
api_keys_db = [
    {
        "id": 1,
        "name": "Production API Key",
        "key_prefix": "cbam_pk_",
        "key_hash": hashlib.sha256("cbam_pk_abc123xyz".encode()).hexdigest(),
        "permissions": ["read", "write"],
        "created_at": "2024-01-01T10:00:00",
        "last_used": "2024-01-19T14:30:00",
        "expires_at": "2025-01-01T10:00:00",
        "active": True,
        "usage_count": 1250,
    },
    {
        "id": 2,
        "name": "Development Key",
        "key_prefix": "cbam_dev_",
        "key_hash": hashlib.sha256("cbam_dev_test123".encode()).hexdigest(),
        "permissions": ["read"],
        "created_at": "2024-01-15T08:00:00",
        "last_used": "2024-01-18T16:45:00",
        "expires_at": "2024-07-15T08:00:00",
        "active": True,
        "usage_count": 342,
    },
]

# LLM API keys (stored separately, more secure)
llm_keys_db = {
    "openai": {"configured": True, "last_used": "2024-01-19T14:00:00"},
    "gemini": {"configured": False, "last_used": None},
    "anthropic": {"configured": False, "last_used": None},
}


@router.get("/")
async def get_api_keys():
    """Get all API keys (without revealing actual keys)"""
    return {
        "success": True,
        "api_keys": [
            {
                "id": key["id"],
                "name": key["name"],
                "key_preview": key["key_prefix"] + "•••••••",
                "permissions": key["permissions"],
                "created_at": key["created_at"],
                "last_used": key["last_used"],
                "expires_at": key["expires_at"],
                "active": key["active"],
                "usage_count": key["usage_count"],
            }
            for key in api_keys_db
        ],
    }


@router.post("/")
async def create_api_key(data: APIKeyCreate):
    """Create a new API key"""
    # Generate new key
    key_suffix = secrets.token_urlsafe(24)
    full_key = f"cbam_{'pk' if 'write' in data.permissions else 'sk'}_{key_suffix}"
    key_hash = hashlib.sha256(full_key.encode()).hexdigest()

    new_id = max(k["id"] for k in api_keys_db) + 1 if api_keys_db else 1

    expires_at = None
    if data.expires_days:
        from datetime import timedelta

        expires_at = (datetime.now() + timedelta(days=data.expires_days)).isoformat()

    new_key = {
        "id": new_id,
        "name": data.name,
        "key_prefix": full_key[:12],
        "key_hash": key_hash,
        "permissions": data.permissions,
        "created_at": datetime.now().isoformat(),
        "last_used": None,
        "expires_at": expires_at,
        "active": True,
        "usage_count": 0,
    }

    api_keys_db.append(new_key)

    # Return full key only once at creation
    return {
        "success": True,
        "api_key": {
            "id": new_key["id"],
            "name": new_key["name"],
            "key": full_key,  # Only shown once!
            "permissions": new_key["permissions"],
            "expires_at": new_key["expires_at"],
        },
        "warning": "Bu API anahtarı sadece bir kez gösterilecek. Güvenli bir yerde saklayın!",
    }


@router.put("/{key_id}")
async def update_api_key(key_id: int, data: APIKeyUpdate):
    """Update API key settings"""
    for key in api_keys_db:
        if key["id"] == key_id:
            if data.name:
                key["name"] = data.name
            if data.active is not None:
                key["active"] = data.active
            return {"success": True, "message": "API key updated"}

    raise HTTPException(status_code=404, detail="API key not found")


@router.delete("/{key_id}")
async def revoke_api_key(key_id: int):
    """Revoke (delete) an API key"""
    global api_keys_db
    for i, key in enumerate(api_keys_db):
        if key["id"] == key_id:
            api_keys_db.pop(i)
            return {"success": True, "message": "API key revoked"}

    raise HTTPException(status_code=404, detail="API key not found")


@router.get("/llm-providers")
async def get_llm_provider_status():
    """Get LLM provider API key status"""
    return {
        "success": True,
        "providers": {
            "openai": {
                "name": "OpenAI (GPT-4)",
                "configured": llm_keys_db["openai"]["configured"],
                "last_used": llm_keys_db["openai"]["last_used"],
            },
            "gemini": {
                "name": "Google Gemini",
                "configured": llm_keys_db["gemini"]["configured"],
                "last_used": llm_keys_db["gemini"]["last_used"],
            },
            "anthropic": {
                "name": "Anthropic Claude",
                "configured": llm_keys_db["anthropic"]["configured"],
                "last_used": llm_keys_db["anthropic"]["last_used"],
            },
        },
    }


@router.post("/llm-providers/{provider}")
async def update_llm_provider_key(provider: str, api_key: str):
    """Update LLM provider API key"""
    if provider not in llm_keys_db:
        raise HTTPException(status_code=400, detail="Invalid provider")

    # In production, encrypt and store securely
    llm_keys_db[provider] = {"configured": bool(api_key), "last_used": None}

    return {"success": True, "message": f"{provider} API key updated"}


@router.get("/usage")
async def get_api_usage_stats():
    """Get API usage statistics"""
    total_calls = sum(k["usage_count"] for k in api_keys_db)

    return {
        "success": True,
        "stats": {
            "total_api_calls": total_calls,
            "active_keys": len([k for k in api_keys_db if k["active"]]),
            "total_keys": len(api_keys_db),
            "monthly_usage": [
                {"month": "Oca", "calls": 450},
                {"month": "Şub", "calls": 520},
                {"month": "Mar", "calls": 480},
            ],
        },
    }
