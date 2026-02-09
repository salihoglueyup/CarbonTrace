from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()


def init_compliance_items(db: Session):
    """Initialize default compliance items if table is empty"""
    count = db.query(models.ComplianceItem).count()
    if count > 0:
        return

    items = [
        # Registration
        {
            "category": "Registration",
            "title": "Registered on EU CBAM portal",
            "title_tr": "AB CBAM portalına kayıt yapıldı",
            "deadline": datetime(2024, 1, 1),
            "priority": "High",
        },
        {
            "category": "Registration",
            "title": "Importer declaration prepared",
            "title_tr": "İthalatçı beyanı hazırlandı",
            "deadline": datetime(2024, 3, 31),
            "priority": "High",
        },
        {
            "category": "Registration",
            "title": "Product categories defined",
            "title_tr": "Ürün kategorileri belirlendi",
            "deadline": datetime(2024, 2, 15),
            "priority": "Medium",
        },
        # Emission
        {
            "category": "Emission",
            "title": "Emission data collected from producers",
            "title_tr": "Üreticilerden emisyon verileri toplandı",
            "deadline": datetime(2024, 3, 1),
            "priority": "High",
        },
        {
            "category": "Emission",
            "title": "Scope 2 electricity emissions calculated",
            "title_tr": "Scope 2 elektrik emisyonları hesaplandı",
            "deadline": datetime(2024, 4, 1),
            "priority": "Medium",
        },
        # Supplier
        {
            "category": "Supplier",
            "title": "Supplier CBAM survey sent",
            "title_tr": "Tedarikçi CBAM anketi gönderildi",
            "deadline": datetime(2024, 2, 1),
            "priority": "Medium",
        },
        {
            "category": "Supplier",
            "title": "Supplier emission reports received",
            "title_tr": "Tedarikçi emisyon raporları alındı",
            "deadline": datetime(2024, 8, 1),
            "priority": "High",
        },
        # Financial
        {
            "category": "Financial",
            "title": "CBAM cost estimation completed",
            "title_tr": "CBAM maliyet tahmini yapıldı",
            "deadline": datetime(2024, 1, 15),
            "priority": "High",
        },
        # Certification
        {
            "category": "Certification",
            "title": "CBAM certificate application submitted",
            "title_tr": "CBAM sertifikası için başvuru yapıldı",
            "deadline": datetime(2026, 1, 1),
            "priority": "High",
        },
    ]

    for item_data in items:
        item = models.ComplianceItem(**item_data)
        db.add(item)

    db.commit()


@router.get("/items", response_model=List[schemas.ComplianceItemResponse])
def read_compliance_items(db: Session = Depends(get_db)):
    init_compliance_items(db)  # Ensure items exist
    return db.query(models.ComplianceItem).all()


@router.get("/status", response_model=List[schemas.ComplianceStatusDetail])
def read_company_compliance_status(company_id: int, db: Session = Depends(get_db)):
    init_compliance_items(db)  # Ensure items exist

    items = db.query(models.ComplianceItem).all()
    statuses = (
        db.query(models.CompanyCompliance)
        .filter(models.CompanyCompliance.company_id == company_id)
        .all()
    )

    status_map = {s.item_id: s for s in statuses}

    result = []
    for item in items:
        status = status_map.get(item.id)
        # Create a temporary response object if status doesn't exist in DB yet
        # But we return None for status field if not found, frontend handles it.
        # Actually Schema expects Optional[CompanyComplianceResponse]

        result.append({"item": item, "status": status})

    return result


@router.put("/status/{item_id}", response_model=schemas.CompanyComplianceResponse)
def update_compliance_status(
    item_id: int,
    status_update: schemas.CompanyComplianceUpdate,
    company_id: int,  # Should come from auth/query
    db: Session = Depends(get_db),
):
    # Check if item exists
    item = (
        db.query(models.ComplianceItem)
        .filter(models.ComplianceItem.id == item_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Compliance item not found")

    # Check if status record exists
    db_status = (
        db.query(models.CompanyCompliance)
        .filter(
            models.CompanyCompliance.company_id == company_id,
            models.CompanyCompliance.item_id == item_id,
        )
        .first()
    )

    if db_status:
        # Update existing
        db_status.is_completed = status_update.is_completed
        db_status.notes = status_update.notes
        if status_update.is_completed and not db_status.completed_at:
            db_status.completed_at = datetime.utcnow()
        elif not status_update.is_completed:
            db_status.completed_at = None
    else:
        # Create new
        db_status = models.CompanyCompliance(
            company_id=company_id,
            item_id=item_id,
            is_completed=status_update.is_completed,
            notes=status_update.notes,
            completed_at=datetime.utcnow() if status_update.is_completed else None,
        )
        db.add(db_status)

    db.commit()
    db.refresh(db_status)
    return db_status
