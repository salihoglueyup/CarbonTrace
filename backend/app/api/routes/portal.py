from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

from app.db.database import get_db
from app.core.security import (
    require_admin,
    create_magic_link_token,
    verify_magic_link_token,
)
from app.core.config import settings
from app.models.supplier import Supplier
from app.models.models import EmissionRecord, Company, CBAMCategory

router = APIRouter()

# --- Schemas ---


class MagicLinkRequest(BaseModel):
    supplier_id: int


class MagicLinkResponse(BaseModel):
    link: str
    token: str
    expires_at: datetime


class SupplierDataSubmission(BaseModel):
    token: str
    year: int
    period: str = "Yıllık"
    scope1: float
    scope2: float
    scope3: float
    notes: Optional[str] = None


class PortalVerifyResponse(BaseModel):
    valid: bool
    supplier_name: str
    supplier_id: int
    company_name: Optional[str] = None


# --- Endpoints ---


@router.post("/generate-link", response_model=MagicLinkResponse)
def generate_supplier_link(
    request: MagicLinkRequest,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Generate a magic link for a supplier. Admin only.
    """
    supplier = db.query(Supplier).filter(Supplier.id == request.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Tedarikçi bulunamadı")

    # Create magic link token
    token_data = {"sub": str(supplier.id), "type": "magic_link", "name": supplier.name}
    token = create_magic_link_token(token_data)

    # Construct link (Assuming frontend runs on same domain or configured URL)
    # In production, this should be an env variable like FRONTEND_URL
    base_url = "http://localhost:5173"  # Default local vite port
    link = f"{base_url}/portal/login?token={token}"

    return {
        "link": link,
        "token": token,
        "expires_at": datetime.utcnow(),  # Approximate, real expiry is in token
    }


@router.get("/verify/{token}", response_model=PortalVerifyResponse)
def verify_portal_token(token: str, db: Session = Depends(get_db)):
    """
    Verify a magic link token and return supplier info. Public endpoint.
    """
    payload = verify_magic_link_token(token)
    if not payload:
        raise HTTPException(
            status_code=401, detail="Geçersiz veya süresi dolmuş bağlantı"
        )

    supplier_id = int(payload.get("sub"))
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()

    if not supplier:
        raise HTTPException(status_code=404, detail="Tedarikçi bulunamadı")

    company_name = None
    if supplier.company_id:
        company = db.query(Company).filter(Company.id == supplier.company_id).first()
        if company:
            company_name = company.name

    return {
        "valid": True,
        "supplier_name": supplier.name,
        "supplier_id": supplier.id,
        "company_name": company_name,
    }


@router.post("/submit")
def submit_supplier_data(
    submission: SupplierDataSubmission, db: Session = Depends(get_db)
):
    """
    Submit emission data via portal.
    """
    payload = verify_magic_link_token(submission.token)
    if not payload:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş token")

    supplier_id = int(payload.get("sub"))
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()

    if not supplier:
        raise HTTPException(status_code=404, detail="Tedarikçi bulunamadı")

    # Update supplier emission data
    supplier.annual_emissions = (
        submission.scope1 + submission.scope2 + submission.scope3
    )
    supplier.updated_at = datetime.utcnow()
    supplier.has_emission_report = True

    # Optionally, we could create an EmissionRecord if the supplier is linked to a company
    # But for now, just updating the supplier record is enough for the prototype

    db.commit()

    return {"message": "Veri başarıyla kaydedildi", "supplier": supplier.name}
