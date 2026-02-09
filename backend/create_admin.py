# -*- coding: utf-8 -*-
import sqlite3
import hashlib
import os
import base64
from datetime import datetime

# Simple bcrypt-like hash using passlib - avoid bcrypt issues
import bcrypt

conn = sqlite3.connect("cbamguard.db")
c = conn.cursor()

email = "admin@cbamguard.com"
password = b"admin123"
full_name = "Admin"
role = "admin"

# Generate bcrypt hash
salt = bcrypt.gensalt()
password_hash = bcrypt.hashpw(password, salt).decode("utf-8")

# Check if exists
c.execute("SELECT id FROM users WHERE email=?", (email,))
existing = c.fetchone()

if existing:
    c.execute(
        "UPDATE users SET password_hash=?, role=? WHERE email=?",
        (password_hash, role, email),
    )
    print("Sifre guncellendi!")
else:
    c.execute(
        """
        INSERT INTO users (email, password_hash, full_name, role, is_active, created_at)
        VALUES (?, ?, ?, ?, 1, ?)
    """,
        (email, password_hash, full_name, role, datetime.now().isoformat()),
    )
    print("Admin kullanici olusturuldu!")

conn.commit()

print(f"\n==== GIRIS BILGILERI ====")
print(f"Email: {email}")
print(f"Sifre: admin123")
print(f"Rol: {role}")

conn.close()
