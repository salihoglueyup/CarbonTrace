# -*- coding: utf-8 -*-
import sys

sys.path.insert(0, ".")
import sqlite3

# Import all models first to avoid mapper issues
from app.models.models import Company, CBAMProduct, EmissionRecord
from app.models.user import User, PasswordResetToken
from app.core.security import get_password_hash

# Create proper password hash using project's security module
password = "admin123"
password_hash = get_password_hash(password)
print(f"New password hash: {password_hash[:50]}...")

# Update in database directly
conn = sqlite3.connect("cbamguard.db")
c = conn.cursor()

email = "admin@cbamguard.com"
c.execute("UPDATE users SET password_hash=? WHERE email=?", (password_hash, email))
conn.commit()

print(f"\n==== GUNCELLENDI ====")
print(f"Email: {email}")
print(f"Sifre: {password}")
print(f"Rol: admin")

conn.close()
