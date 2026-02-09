import sqlite3

conn = sqlite3.connect("cbamguard.db")
c = conn.cursor()

# List tables
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in c.fetchall()]
print("Tablolar:", tables)

# Check users
if "users" in tables:
    c.execute("SELECT email, full_name, role FROM users")
    users = c.fetchall()
    if users:
        print("\n--- MEVCUT KULLANICILAR ---")
        for u in users:
            print(f"Email: {u[0]} | Ad: {u[1]} | Rol: {u[2]}")
    else:
        print("Kullanici kaydi yok")
else:
    print("users tablosu yok")

conn.close()
