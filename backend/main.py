from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import (
    companies,
    dashboard,
    chat,
    emissions,
    cbam,
    auth,
    export,
    documents,
    suppliers,
    notifications,
    apikeys,
    websocket,
    recommendations,
    audit,
    security,
    performance,
    reports,
    projects,
    calendar,
    compliance,
    users,
    finance,
    ai,
    portal,
    market,
)
from app.db.database import engine, Base
from app.db.init_db import init_db
from app.models.models import (
    Company,
    CBAMProduct,
    EmissionRecord,
)  # Important for relationships
from app.models.user import (
    User,
    PasswordResetToken,
)
from app.models.finance import (
    CarbonPriceScenario,
    FinancialProjection,
)
from app.core.config import settings

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CBAM Guard API",
    description="KOBİ'ler için CBAM Uyum ve Yeşil Finansman Platformu",
    version="4.0.0",
)

# CORS - Allow frontend origin
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# REST Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(companies.router, prefix="/api/companies", tags=["Companies"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(emissions.router, prefix="/api/emissions", tags=["Emissions"])
app.include_router(cbam.router, prefix="/api/cbam", tags=["CBAM"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(suppliers.router, prefix="/api/suppliers", tags=["Suppliers"])
app.include_router(
    notifications.router, prefix="/api/notifications", tags=["Notifications"]
)
app.include_router(apikeys.router, prefix="/api/apikeys", tags=["API Keys"])
app.include_router(
    recommendations.router, prefix="/api/recommendations", tags=["AI Recommendations"]
)
app.include_router(audit.router, prefix="/api/audit", tags=["Audit Log"])
app.include_router(security.router, prefix="/api/security", tags=["Security"])
app.include_router(performance.router, prefix="/api/performance", tags=["Performance"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(finance.router, prefix="/api/finance", tags=["Finance"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Assistant"])
app.include_router(portal.router, prefix="/api/portal", tags=["Supplier Portal"])
app.include_router(market.router, prefix="/api/market", tags=["Market Data"])

# WebSocket Routes
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])


@app.on_event("startup")
async def startup_event():
    init_db()
    print("🚀 CBAM Guard API v4.0 başlatıldı!")
    print("📡 WebSocket: ws://localhost:8000/ws/chat")
    print("🧠 AI Recommendations: /api/recommendations")
    print("📊 Performance: /api/performance")
    print("🔒 Security: /api/security")

    # DEBUG: Print all registered routes
    print("\n--- Registered Routes ---")
    for route in app.routes:
        if hasattr(route, "path"):
            methods = getattr(route, "methods", ["WS"])
            print(f"{methods} {route.path}")
    print("-------------------------\n")


@app.get("/")
async def root():
    return {
        "message": "CBAM Guard API",
        "version": "4.0.0",
        "status": "running",
        "features": [
            "REST API",
            "WebSocket Chat",
            "Real-time Notifications",
            "AI Recommendations",
            "Audit Logging",
            "Performance Monitoring",
            "Security Management",
        ],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
