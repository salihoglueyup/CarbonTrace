from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from app.db.database import get_db
from app.models.models import EmissionRecord, Company

router = APIRouter()


# ============================
# Pydantic Models
# ============================


class EmissionRecordResponse(BaseModel):
    id: int
    company_id: int
    year: int
    period: str
    scope1_emissions: float
    scope2_emissions: float
    scope3_emissions: float
    emission_intensity: Optional[float] = None
    data_source: Optional[str] = None
    is_verified: bool
    verified_by: Optional[str] = None
    total_emissions: float


class EmissionCreate(BaseModel):
    company_id: int
    year: int
    period: str = "Yıllık"
    scope1_emissions: float
    scope2_emissions: float
    scope3_emissions: float
    emission_intensity: Optional[float] = None
    data_source: Optional[str] = None


class CompanyEmissionSummary(BaseModel):
    company_id: int
    company_name: str
    sector: str
    latest_year: int
    scope1: float
    scope2: float
    scope3: float
    total: float
    change_percent: Optional[float] = None


class YearlyTrend(BaseModel):
    year: int
    total: float


class ScopeBreakdown(BaseModel):
    scope: str
    value: float
    percentage: float


# ============================
# Endpoints
# ============================


@router.get("/", response_model=List[CompanyEmissionSummary])
def get_all_emissions(db: Session = Depends(get_db)):
    """Tüm şirketlerin emisyon özeti"""
    companies = db.query(Company).filter(Company.is_active == True).all()

    result = []
    for company in companies:
        # Get last 2 years for comparison
        emissions = (
            db.query(EmissionRecord)
            .filter(EmissionRecord.company_id == company.id)
            .order_by(EmissionRecord.year.desc())
            .limit(2)
            .all()
        )

        if not emissions:
            continue

        latest = emissions[0]
        total = (
            latest.scope1_emissions + latest.scope2_emissions + latest.scope3_emissions
        )

        # Calculate change from previous year
        change_percent = None
        if len(emissions) > 1:
            prev = emissions[1]
            prev_total = (
                prev.scope1_emissions + prev.scope2_emissions + prev.scope3_emissions
            )
            if prev_total > 0:
                change_percent = round(((total - prev_total) / prev_total) * 100, 1)

        result.append(
            CompanyEmissionSummary(
                company_id=company.id,
                company_name=company.name,
                sector=company.sector or "Bilinmiyor",
                latest_year=latest.year,
                scope1=latest.scope1_emissions,
                scope2=latest.scope2_emissions,
                scope3=latest.scope3_emissions,
                total=total,
                change_percent=change_percent,
            )
        )

    # Sort by total emissions descending
    result.sort(key=lambda x: x.total, reverse=True)
    return result


@router.get("/trend", response_model=List[YearlyTrend])
def get_emission_trend(
    company_id: Optional[int] = Query(
        None, description="Specific company ID, or all if not provided"
    ),
    db: Session = Depends(get_db),
):
    """Yıllık emisyon trendi"""
    query = db.query(
        EmissionRecord.year,
        func.sum(
            EmissionRecord.scope1_emissions
            + EmissionRecord.scope2_emissions
            + EmissionRecord.scope3_emissions
        ).label("total"),
    )

    if company_id:
        query = query.filter(EmissionRecord.company_id == company_id)

    results = query.group_by(EmissionRecord.year).order_by(EmissionRecord.year).all()

    return [YearlyTrend(year=r.year, total=r.total or 0) for r in results]


@router.get("/breakdown/{company_id}", response_model=List[ScopeBreakdown])
def get_scope_breakdown(
    company_id: int, year: Optional[int] = None, db: Session = Depends(get_db)
):
    """Scope bazlı emisyon dağılımı"""

    query = db.query(EmissionRecord).filter(EmissionRecord.company_id == company_id)

    if year:
        emission = query.filter(EmissionRecord.year == year).first()
    else:
        emission = query.order_by(EmissionRecord.year.desc()).first()

    if not emission:
        raise HTTPException(status_code=404, detail="Emission record not found")

    total = (
        emission.scope1_emissions
        + emission.scope2_emissions
        + emission.scope3_emissions
    )

    result = [
        ScopeBreakdown(
            scope="Scope 1",
            value=emission.scope1_emissions,
            percentage=round(
                (emission.scope1_emissions / total * 100) if total > 0 else 0, 1
            ),
        ),
        ScopeBreakdown(
            scope="Scope 2",
            value=emission.scope2_emissions,
            percentage=round(
                (emission.scope2_emissions / total * 100) if total > 0 else 0, 1
            ),
        ),
        ScopeBreakdown(
            scope="Scope 3",
            value=emission.scope3_emissions,
            percentage=round(
                (emission.scope3_emissions / total * 100) if total > 0 else 0, 1
            ),
        ),
    ]

    return result


@router.get("/{company_id}", response_model=List[EmissionRecordResponse])
def get_company_emissions(company_id: int, db: Session = Depends(get_db)):
    """Şirketin emisyon kayıtları"""
    emissions = (
        db.query(EmissionRecord)
        .filter(EmissionRecord.company_id == company_id)
        .order_by(EmissionRecord.year.desc())
        .all()
    )

    result = []
    for e in emissions:
        result.append(
            EmissionRecordResponse(
                id=e.id,
                company_id=e.company_id,
                year=e.year,
                period=e.period,
                scope1_emissions=e.scope1_emissions,
                scope2_emissions=e.scope2_emissions,
                scope3_emissions=e.scope3_emissions,
                emission_intensity=e.emission_intensity,
                data_source=e.data_source,
                is_verified=e.is_verified,
                verified_by=e.verified_by,
                total_emissions=e.scope1_emissions
                + e.scope2_emissions
                + e.scope3_emissions,
            )
        )

    return result


@router.post("/", response_model=EmissionRecordResponse)
def create_emission(emission: EmissionCreate, db: Session = Depends(get_db)):
    """Yeni emisyon kaydı oluştur"""

    # Check if company exists
    company = db.query(Company).filter(Company.id == emission.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Check if record already exists for this year
    existing = (
        db.query(EmissionRecord)
        .filter(
            EmissionRecord.company_id == emission.company_id,
            EmissionRecord.year == emission.year,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Emission record for year {emission.year} already exists",
        )

    new_emission = EmissionRecord(
        company_id=emission.company_id,
        year=emission.year,
        period=emission.period,
        scope1_emissions=emission.scope1_emissions,
        scope2_emissions=emission.scope2_emissions,
        scope3_emissions=emission.scope3_emissions,
        emission_intensity=emission.emission_intensity,
        data_source=emission.data_source,
        is_verified=False,
    )

    db.add(new_emission)
    db.commit()
    db.refresh(new_emission)

    return EmissionRecordResponse(
        id=new_emission.id,
        company_id=new_emission.company_id,
        year=new_emission.year,
        period=new_emission.period,
        scope1_emissions=new_emission.scope1_emissions,
        scope2_emissions=new_emission.scope2_emissions,
        scope3_emissions=new_emission.scope3_emissions,
        emission_intensity=new_emission.emission_intensity,
        data_source=new_emission.data_source,
        is_verified=new_emission.is_verified,
        verified_by=new_emission.verified_by,
        total_emissions=new_emission.scope1_emissions
        + new_emission.scope2_emissions
        + new_emission.scope3_emissions,
    )


@router.get("/comparison/top", response_model=List[CompanyEmissionSummary])
def get_top_emitters(limit: int = 10, db: Session = Depends(get_db)):
    """En yüksek emisyonlu şirketler"""

    # Get latest year emissions for each company
    companies = db.query(Company).filter(Company.is_active == True).all()

    summaries = []
    for company in companies:
        latest = (
            db.query(EmissionRecord)
            .filter(EmissionRecord.company_id == company.id)
            .order_by(EmissionRecord.year.desc())
            .first()
        )

        if latest:
            total = (
                latest.scope1_emissions
                + latest.scope2_emissions
                + latest.scope3_emissions
            )
            summaries.append(
                CompanyEmissionSummary(
                    company_id=company.id,
                    company_name=company.name,
                    sector=company.sector or "Bilinmiyor",
                    latest_year=latest.year,
                    scope1=latest.scope1_emissions,
                    scope2=latest.scope2_emissions,
                    scope3=latest.scope3_emissions,
                    total=total,
                    change_percent=None,
                )
            )

    # Sort and limit
    summaries.sort(key=lambda x: x.total, reverse=True)
    return summaries[:limit]
