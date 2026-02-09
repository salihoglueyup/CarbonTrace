# -*- coding: utf-8 -*-
import sys

sys.path.insert(0, ".")

from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password

db = SessionLocal()

email = "admin@cbamguard.com"
password = "admin123"

user = db.query(User).filter(User.email == email).first()

if user:
    print(f"Kullanici bulundu: {user.email}")
    print(f"Role: {user.role}")
    print(f"Password hash: {user.password_hash[:30]}...")

    # Test password verification
    try:
        result = verify_password(password, user.password_hash)
        print(f"Password verify: {result}")
    except Exception as e:
        print(f"Password verify error: {e}")
else:
    print("Kullanici bulunamadi!")

db.close()
