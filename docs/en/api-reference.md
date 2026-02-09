# 📡 API Reference

The CBAM Guard API is built on RESTful principles. All responses are in JSON format.

> **Base URL:** `http://localhost:8000/api`

## 🔐 Authentication

### Login

Authenticate a user and retrieve an access token.

* **Endpoint:** `POST /token`
* **Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `username` | string | User's email address |
| `password` | string | User's password |

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer"
}
```

---

## 📊 Dashboard

### Get Statistics

Retrieve high-level KPI data for the dashboard.

* **Endpoint:** `GET /dashboard/stats`
* **Auth Required:** Yes

**Response (200 OK):**

```json
{
  "total_emissions": 12500.4,
  "estimated_tax": 450000,
  "active_alerts": 3,
  "ytd_change": -5.2
}
```

---

## 🏭 Emissions

### Get Emission Trend

Get historical emission data aggregated by month.

* **Endpoint:** `GET /emissions/trend`
* **Query Params:**
  * `start_date` (YYYY-MM-DD): Filter start
  * `end_date` (YYYY-MM-DD): Filter end

**Response (200 OK):**

```json
[
  {
    "month": "Jan",
    "scope1": 120,
    "scope2": 80,
    "scope3": 200
  },
  {
    "month": "Feb",
    "scope1": 115,
    "scope2": 78,
    "scope3": 190
  }
]
```

---

## 🌍 Real-time

### WebSocket Notifications

Connect to the live notification stream.

* **Endpoint:** `WS /ws/notifications`

**Message Format:**

```json
{
  "type": "alert",
  "severity": "high",
  "message": "Quota limit reached for Factory A",
  "timestamp": "2023-10-27T10:00:00Z"
}
```
