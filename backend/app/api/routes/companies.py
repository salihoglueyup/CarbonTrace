from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import Company, EmissionRecord
from app.schemas.schemas import CompanyResponse, CompanyListResponse, CompanyCreate

router = APIRouter()


@router.get("/", response_model=List[CompanyListResponse])
def get_companies(db: Session = Depends(get_db)):
    """Tüm şirketleri listele"""
    companies = db.query(Company).filter(Company.is_active == True).all()

    result = []
    for company in companies:
        # En son emisyon verisini al
        latest_emission = (
            db.query(EmissionRecord)
            .filter(EmissionRecord.company_id == company.id)
            .order_by(EmissionRecord.year.desc())
            .first()
        )

        total_emissions = 0
        if latest_emission:
            total_emissions = (
                latest_emission.scope1_emissions
                + latest_emission.scope2_emissions
                + latest_emission.scope3_emissions
            )

        # Risk seviyesi hesapla
        risk_level = "Low"
        if total_emissions > 100000:
            risk_level = "Critical"
        elif total_emissions > 50000:
            risk_level = "High"
        elif total_emissions > 20000:
            risk_level = "Medium"

        result.append(
            CompanyListResponse(
                id=company.id,
                name=company.name,
                sector=company.sector,
                city=company.city,
                total_emissions=total_emissions,
                risk_level=risk_level,
            )
        )

    return result


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(company_id: int, db: Session = Depends(get_db)):
    """Şirket detayı"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")
    return company


@router.post("/", response_model=CompanyResponse)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    """Yeni şirket oluştur"""
    db_company = Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company
