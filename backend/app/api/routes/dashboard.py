from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.models import Company, EmissionRecord, CBAMProduct
from app.models.supplier import Supplier
from pydantic import BaseModel

router = APIRouter()


# ============================
# Pydantic Models
# ============================


class DashboardStats(BaseModel):
    total_companies: int
    total_emissions: float
    estimated_cbam_cost: float
    high_risk_count: int
    total_suppliers: Optional[int] = 0
    cbam_ready_suppliers: Optional[int] = 0


class CompanySummary(BaseModel):
    id: int
    name: str
    sector: str
    emissions: float
    risk_progress: int
    risk_level: str


class EmissionTrendItem(BaseModel):
    year: int
    scope1: float
    scope2: float
    scope3: float
    total: float


class SectorBreakdown(BaseModel):
    sector: str
    emissions: float
    percentage: float
    company_count: int


class RecentActivity(BaseModel):
    id: int
    type: str
    message: str
    timestamp: str
    icon: str


class CBAMProjection(BaseModel):
    year: int
    cost: float
    rate: float


# ============================
# Endpoints
# ============================


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Dashboard istatistikleri"""
    companies = db.query(Company).filter(Company.is_active == True).all()
    suppliers = db.query(Supplier).all()

    total_emissions = 0
    high_risk_count = 0

    for company in companies:
        latest_emission = (
            db.query(EmissionRecord)
            .filter(EmissionRecord.company_id == company.id)
            .order_by(EmissionRecord.year.desc())
            .first()
        )

        if latest_emission:
            company_emissions = (
                latest_emission.scope1_emissions
                + latest_emission.scope2_emissions
                + latest_emission.scope3_emissions
            )
            total_emissions += company_emissions

            if company_emissions > 50000:
                high_risk_count += 1

    # Tahmini CBAM maliyeti (90 EUR/tCO2e ortalama fiyat)
    estimated_cbam_cost = total_emissions * 90

    # Supplier stats
    cbam_ready = len([s for s in suppliers if s.cbam_ready])

    return DashboardStats(
        total_companies=len(companies),
        total_emissions=total_emissions,
        estimated_cbam_cost=estimated_cbam_cost,
        high_risk_count=high_risk_count,
        total_suppliers=len(suppliers),
        cbam_ready_suppliers=cbam_ready,
    )


@router.get("/companies-summary", response_model=List[CompanySummary])
def get_companies_summary(db: Session = Depends(get_db)):
    """Dashboard için şirket özeti"""
    companies = db.query(Company).filter(Company.is_active == True).all()

    result = []
    for company in companies:
        latest_emission = (
            db.query(EmissionRecord)
            .filter(EmissionRecord.company_id == company.id)
            .order_by(EmissionRecord.year.desc())
            .first()
        )

        emissions = 0
        if latest_emission:
            emissions = (
                latest_emission.scope1_emissions
                + latest_emission.scope2_emissions
                + latest_emission.scope3_emissions
            )

        # Risk hesapla
        if emissions > 100000:
            risk_level = "Kritik"
            risk_progress = 90
        elif emissions > 50000:
            risk_level = "Yüksek"
            risk_progress = 75
        elif emissions > 20000:
            risk_level = "Orta"
            risk_progress = 45
        else:
            risk_level = "Düşük"
            risk_progress = 25

        result.append(
            CompanySummary(
                id=company.id,
                name=company.name,
                sector=company.sector or "Bilinmiyor",
                emissions=emissions,
                risk_progress=risk_progress,
                risk_level=risk_level,
            )
        )

    return result


@router.get("/emission-trend", response_model=List[EmissionTrendItem])
def get_emission_trend(db: Session = Depends(get_db)):
    """Yıllık emisyon trendi (tüm şirketler toplam)"""

    # Son 5 yıl için
    years = range(2020, 2025)
    result = []

    for year in years:
        emissions = db.query(EmissionRecord).filter(EmissionRecord.year == year).all()

        scope1 = sum(e.scope1_emissions for e in emissions)
        scope2 = sum(e.scope2_emissions for e in emissions)
        scope3 = sum(e.scope3_emissions for e in emissions)

        result.append(
            EmissionTrendItem(
                year=year,
                scope1=scope1,
                scope2=scope2,
                scope3=scope3,
                total=scope1 + scope2 + scope3,
            )
        )

    return result


@router.get("/sector-breakdown", response_model=List[SectorBreakdown])
def get_sector_breakdown(db: Session = Depends(get_db)):
    """Sektöre göre emisyon dağılımı"""

    companies = db.query(Company).filter(Company.is_active == True).all()

    sector_data = {}

    for company in companies:
        sector = company.sector or "Diğer"

        latest_emission = (
            db.query(EmissionRecord)
            .filter(EmissionRecord.company_id == company.id)
            .order_by(EmissionRecord.year.desc())
            .first()
        )

        if latest_emission:
            emissions = (
                latest_emission.scope1_emissions
                + latest_emission.scope2_emissions
                + latest_emission.scope3_emissions
            )
        else:
            emissions = 0

        if sector not in sector_data:
            sector_data[sector] = {"emissions": 0, "count": 0}

        sector_data[sector]["emissions"] += emissions
        sector_data[sector]["count"] += 1

    # Calculate total for percentages
    total = sum(s["emissions"] for s in sector_data.values())

    result = []
    for sector, data in sector_data.items():
        result.append(
            SectorBreakdown(
                sector=sector,
                emissions=data["emissions"],
                percentage=round(
                    (data["emissions"] / total * 100) if total > 0 else 0, 1
                ),
                company_count=data["count"],
            )
        )

    # Sort by emissions descending
    result.sort(key=lambda x: x.emissions, reverse=True)

    return result


@router.get("/recent-activities", response_model=List[RecentActivity])
def get_recent_activities(db: Session = Depends(get_db)):
    """Son aktiviteler (simüle edilmiş - gerçek audit log'dan alınabilir)"""

    # En son eklenen şirketler ve emisyonlar
    recent_companies = (
        db.query(Company).order_by(Company.created_at.desc()).limit(3).all()
    )
    recent_emissions = (
        db.query(EmissionRecord)
        .order_by(EmissionRecord.created_at.desc())
        .limit(3)
        .all()
    )
    recent_suppliers = (
        db.query(Supplier).order_by(Supplier.created_at.desc()).limit(2).all()
    )

    activities = []

    for i, company in enumerate(recent_companies):
        activities.append(
            RecentActivity(
                id=len(activities) + 1,
                type="company",
                message=f"{company.name} sisteme eklendi",
                timestamp=(
                    company.created_at.strftime("%Y-%m-%d %H:%M")
                    if company.created_at
                    else "Bilinmiyor"
                ),
                icon="🏢",
            )
        )

    for emission in recent_emissions:
        company = db.query(Company).filter(Company.id == emission.company_id).first()
        company_name = company.name if company else "Bilinmeyen"
        activities.append(
            RecentActivity(
                id=len(activities) + 1,
                type="emission",
                message=f"{company_name} için {emission.year} emisyon kaydı eklendi",
                timestamp=(
                    emission.created_at.strftime("%Y-%m-%d %H:%M")
                    if emission.created_at
                    else "Bilinmiyor"
                ),
                icon="🌿",
            )
        )

    for supplier in recent_suppliers:
        activities.append(
            RecentActivity(
                id=len(activities) + 1,
                type="supplier",
                message=f"{supplier.name} tedarikçi olarak eklendi",
                timestamp=(
                    supplier.created_at.strftime("%Y-%m-%d %H:%M")
                    if supplier.created_at
                    else "Bilinmiyor"
                ),
                icon="🏭",
            )
        )

    # Sort by newest first (in real app, use timestamps)
    return activities[:10]


@router.get("/cbam-projection", response_model=List[CBAMProjection])
def get_cbam_projection(db: Session = Depends(get_db)):
    """CBAM maliyet projeksiyonu (2024-2034)"""

    # Mevcut toplam emisyon
    stats = get_dashboard_stats(db)
    base_emissions = stats.total_emissions

    # CBAM oranları ve karbon fiyatı projeksiyonu
    projections = []
    carbon_price = 90  # EUR/tCO2e starting price

    for year in range(2024, 2035):
        # CBAM phase-in rates
        if year < 2026:
            rate = 0
        elif year == 2026:
            rate = 0.025
        elif year == 2027:
            rate = 0.05
        elif year == 2028:
            rate = 0.10
        elif year == 2029:
            rate = 0.225
        elif year == 2030:
            rate = 0.35
        elif year == 2031:
            rate = 0.475
        elif year == 2032:
            rate = 0.60
        elif year == 2033:
            rate = 0.775
        else:  # 2034+
            rate = 1.0

        # Carbon price grows ~5% per year
        year_price = carbon_price * (1.05 ** (year - 2024))

        # Calculate cost
        cost = base_emissions * year_price * rate

        projections.append(CBAMProjection(year=year, cost=round(cost, 0), rate=rate))

    return projections
