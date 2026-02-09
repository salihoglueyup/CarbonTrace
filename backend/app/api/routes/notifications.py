from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.core.websocket_manager import ws_manager

router = APIRouter()


@router.get("/", response_model=dict)
def get_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(20),
    user_id: int = Query(1),  # TODO: Get from auth
    db: Session = Depends(get_db),
):
    """Get all notifications for a user"""
    # Base query: active notifications for user or company-wide or public (user_id=None)
    # For now, let's assume we fetch for specific user + public ones

    # Simple logic: Fetch where user_id matches
    query = db.query(models.Notification).filter(models.Notification.user_id == user_id)

    if unread_only:
        query = query.filter(models.Notification.is_read == False)

    total_count = query.count()

    results = query.order_by(models.Notification.created_at.desc()).limit(limit).all()

    # Calculate unread count globally for this user
    unread_count = (
        db.query(models.Notification)
        .filter(
            models.Notification.user_id == user_id, models.Notification.is_read == False
        )
        .count()
    )

    return {
        "success": True,
        "notifications": results,
        "unread_count": unread_count,
        "total": total_count,
    }


@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    user_id: int = Query(1),  # TODO: Auth
    db: Session = Depends(get_db),
):
    """Mark a notification as read"""
    notification = (
        db.query(models.Notification)
        .filter(
            models.Notification.id == notification_id,
            models.Notification.user_id == user_id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.commit()

    return {"success": True}


@router.put("/read-all")
def mark_all_as_read(
    user_id: int = Query(1), db: Session = Depends(get_db)  # TODO: Auth
):
    """Mark all notifications as read"""
    db.query(models.Notification).filter(
        models.Notification.user_id == user_id, models.Notification.is_read == False
    ).update({"is_read": True, "read_at": datetime.utcnow()})

    db.commit()
    return {"success": True, "message": "All notifications marked as read"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    user_id: int = Query(1),  # TODO: Auth
    db: Session = Depends(get_db),
):
    """Delete a notification"""
    notification = (
        db.query(models.Notification)
        .filter(
            models.Notification.id == notification_id,
            models.Notification.user_id == user_id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notification)
    db.commit()
    return {"success": True}


@router.post("/", response_model=dict)
async def create_notification(
    notification: schemas.NotificationCreate, db: Session = Depends(get_db)
):
    """Create a new notification"""
    db_notification = models.Notification(
        user_id=notification.user_id,
        company_id=notification.company_id,
        type=notification.type,
        title=notification.title,
        message=notification.message,
        action_url=notification.action_url,
        icon=notification.icon,
    )

    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    # Convert to dict for broadcasting
    notification_data = {
        "id": db_notification.id,
        "type": db_notification.type,
        "title": db_notification.title,
        "message": db_notification.message,
        "read": False,
        "created_at": db_notification.created_at.isoformat(),
        "action_url": db_notification.action_url,
        "icon": db_notification.icon,
    }

    # Broadcast to connected clients
    if notification.user_id:
        await ws_manager.send_to_user(
            {"type": "notification", "notification": notification_data},
            notification.user_id,
        )
    else:
        # Broadcast to all if no user specified (system wide)
        await ws_manager.broadcast(
            {"type": "notification", "notification": notification_data}
        )

    return {"success": True, "notification": notification_data}
