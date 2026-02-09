# 🔐 Security Guide

Security is a core pillar of CBAM Guard. This document outlines the security mechanisms implemented to protect sensitive emission and financial data.

## 🛡️ Authentication & Authorization

### JWT (JSON Web Tokens)

We use stateless JWT authentication.

* **Format:** Bearer Token
* **Encryption:** HS256 (HMAC with SHA-256)
* **Expiration:** Access tokens are short-lived (configurable, default 30 mins).

### RBAC (Role-Based Access Control)

Access to endpoints is strictly controlled by user roles defined in the `UserRole` enum.

| Role | Permissions |
| :--- | :--- |
| **Admin** | Full system access. Create/Delete users, System Config. |
| **Manager** | View all data, Generate Reports, Invite Suppliers. |
| **Viewer** | Read-only access to Dashboard and Reports. |
| **Supplier** | Limited access to their own data entry portal only. |

## 🔒 Data Protection

### Passwords

* Passwords are **never** stored in plain text.
* We use **Bcrypt** hashing with automatic salt generation.

### Encryption at Rest & In Transit

* **In Transit:** All API traffic must be over HTTPS (TLS 1.2+).
* **At Rest:** Sensitive fields (like API keys for eternal services) should be encrypted in the database (Feature in progress).

## 🛡️ API Security

### Input Validation

All incoming requests are validated using **Pydantic** schemas.

* Prevents SQL Injection by using ORM filtering.
* Prevents XSS by sanitizing inputs before rendering (React handles this automatically).

### Rate Limiting

To prevent DDoS and brute-force attacks:

* **Login Endpoint:** Limited to 5 attempts per minute per IP.
* **Public API:** Limited to 100 requests per minute.

## 🚨 Incident Response

In case of a security breach:

1. **Rotate Secrets:** Immediately change `SECRET_KEY` and DB credentials in `.env`.
2. **Revoke Tokens:** Increment the "min_token_version" in the user table to invalidate all active JWTs.
3. **Audit Logs:** Check the `AuditLog` table for suspicious activity.
