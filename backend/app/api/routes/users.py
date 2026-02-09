from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.models.user import User
from app.core.security import get_current_user
from pydantic import BaseModel, EmailStr

router = APIRouter()


# ============ Schemas ============


class UserUpdateRole(BaseModel):
    role: str


class UserUpdateStatus(BaseModel):
    is_active: bool


class UserResponseAdmin(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    company_id: Optional[int]
    is_active: bool
    last_login: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Dependencies ============


def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gereklidir",
        )
    return current_user


# ============ Routes ============


@router.get("/", response_model=List[UserResponseAdmin])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
):
    """
    Get all users (Admin only)
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.put("/{user_id}/role", response_model=UserResponseAdmin)
async def update_user_role(
    user_id: int,
    role_data: UserUpdateRole,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
):
    """
    Update user role (Admin only)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    if user.id == admin_user.id and role_data.role != "admin":
        raise HTTPException(
            status_code=400,
            detail="Kendi admin yetkinizi kaldıramazsınız. Başka bir admin yapmalıdır.",
        )

    user.role = role_data.role
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}/status", response_model=UserResponseAdmin)
async def update_user_status(
    user_id: int,
    status_data: UserUpdateStatus,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
):
    """
    Update user active status (Admin only)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    if user.id == admin_user.id:
        raise HTTPException(
            status_code=400, detail="Kendi hesabınızı pasife alamazsınız."
        )

    user.is_active = status_data.is_active
    db.commit()
    db.refresh(user)
    return user
