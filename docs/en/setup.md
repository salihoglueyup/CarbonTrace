# 🛠️ Setup & Installation Guide

Welcome to the **CBAM Guard** setup guide. This document covers everything you need to know to get the application running on your local machine for development.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Required For |
| :--- | :--- | :--- |
| **Python** | 3.10+ | Backend Runtime |
| **Node.js** | 18+ | Frontend Runtime |
| **PostgreSQL** | 14+ | Production Database (Optional for Dev) |
| **Git** | Latest | Version Control |

> **Note:** For development, `SQLite` is used by default, so installing PostgreSQL is optional unless you want to test with the production database driver.

---

## 🚀 Step-by-Step Installation

### 1. Clone the Repository

Start by getting the code:

```bash
git clone https://github.com/your-org/cbam-guard.git
cd cbam-guard
```

### 2. Backend Setup (FastAPI)

Navigate to the backend directory and set up the Python environment.

```bash
cd backend
```

#### a. Create Virtual Environment

Isolate dependencies to avoid conflicts.

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### b. Install Dependencies

```bash
pip install -r requirements.txt
```

#### c. Configuration (.env)

Create a `.env` file in the `backend/` directory.

```ini
# .env config
PROJECT_NAME="CBAM Guard"
API_V1_STR="/api"
SECRET_KEY="CHANGE_THIS_TO_A_SECURE_SECRET"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database (Default: SQLite)
DATABASE_URL="sqlite+aiosqlite:///./sql_app.db"

# Optional: PostgreSQL Connection
# DATABASE_URL="postgresql+asyncpg://user:pass@localhost/dbname"

# AI Service (Optional)
OPENAI_API_KEY=""
```

#### d. Run Migrations & Seed Data

Initialize the database and add sample data.

```bash
# Apply migrations
alembic upgrade head

# Seed initial data (Admin user, basic settings)
python scripts/seed_data.py
```

#### e. Start the Server

```bash
uvicorn main:app --reload
```

✅ **Success:** API is running at `http://localhost:8000`.

---

### 3. Frontend Setup (React)

Open a new terminal and navigate to the frontend directory.

```bash
cd frontend
```

#### a. Install Packages

```bash
npm install
# OR
yarn install
```

#### b. Configuration

Create a `.env` file in `frontend/` if you need to override the API URL.

```ini
VITE_API_URL="http://localhost:8000"
```

#### c. Start Development Server

```bash
npm run dev
```

✅ **Success:** App is running at `http://localhost:5173`.

---

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><strong>🔴 Port 8000 is already in use</strong></summary>

The backend cannot start because another service is using port 8000.
**Fix:** Run on a different port:

```bash
uvicorn main:app --reload --port 8001
```

</details>

<details>
<summary><strong>🔴 "Module not found" errors in Python</strong></summary>

You probably forgot to activate the virtual environment.
**Fix:** Run `venv\Scripts\activate` (Win) or `source venv/bin/activate` (Mac/Linux) again.
</details>

<details>
<summary><strong>🔴 CORS Errors in Browser</strong></summary>

The frontend cannot talk to the backend.
**Fix:** Ensure `BACKEND_CORS_ORIGINS` in backend `.env` includes `http://localhost:5173`.
</details>

---

## 🐳 Docker Setup (Alternative)

If you prefer using Docker, you can spin up the entire stack with one command.

```bash
docker-compose up --build
```

This will start:

* Backend on `:8000`
* Frontend on `:3000` (or configured port)
* PostgreSQL on `:5432`
