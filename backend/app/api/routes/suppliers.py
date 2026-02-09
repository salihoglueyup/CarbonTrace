"""
Suppliers API Routes
Tedarik zinciri yönetimi
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# In-memory storage (production'da database kullan)
suppliers_db = [
    {
        "id": 1,
        "name": "Çelik Hammadde A.Ş.",
        "country": "Türkiye",
        "sector": "Hammadde",
        "contact_email": "info@celikhammadde.com",
        "annual_emissions": 15000,
        "scope3_contribution": 12.5,
        "risk_level": "medium",
        "cbam_ready": True,
        "has_emission_report": True,
        "has_cbam_certificate": True,
        "verified": True,
    },
    {
        "id": 2,
        "name": "Balkan Steel Import",
        "country": "Bulgaristan",
        "sector": "Demir-Çelik",
        "contact_email": "contact@balkansteel.bg",
        "annual_emissions": 28000,
        "scope3_contribution": 22.3,
        "risk_level": "high",
        "cbam_ready": False,
        "has_emission_report": False,
        "has_cbam_certificate": False,
        "verified": False,
    },
    {
        "id": 3,
        "name": "EcoEnergy Solutions",
        "country": "Almanya",
        "sector": "Enerji",
        "contact_email": "info@ecoenergy.de",
        "annual_emissions": 5000,
        "scope3_contribution": 4.2,
        "risk_level": "low",
        "cbam_ready": True,
        "has_emission_report": True,
        "has_cbam_certificate": True,
        "verified": True,
    },
    {
        "id": 4,
        "name": "Anadolu Lojistik",
        "country": "Türkiye",
        "sector": "Lojistik",
        "contact_email": "tedarik@anadolulojistik.com",
        "annual_emissions": 8500,
        "scope3_contribution": 7.1,
        "risk_level": "medium",
        "cbam_ready": False,
        "has_emission_report": True,
        "has_cbam_certificate": False,
        "verified": False,
    },
]


class SupplierCreate(BaseModel):
    name: str
    country: str = "Türkiye"
    sector: Optional[str] = None
    contact_email: Optional[str] = None
    annual_emissions: float = 0
    scope3_contribution: float = 0
    risk_level: str = "medium"


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    sector: Optional[str] = None
    contact_email: Optional[str] = None
    annual_emissions: Optional[float] = None
    scope3_contribution: Optional[float] = None
    risk_level: Optional[str] = None
    cbam_ready: Optional[bool] = None
    has_emission_report: Optional[bool] = None
    has_cbam_certificate: Optional[bool] = None
    verified: Optional[bool] = None


@router.get("/")
async def get_suppliers(
    risk_level: Optional[str] = Query(None),
    cbam_ready: Optional[bool] = Query(None),
    verified: Optional[bool] = Query(None),
):
    """Get all suppliers with optional filters"""
    results = suppliers_db

    if risk_level:
        results = [s for s in results if s.get("risk_level") == risk_level]
    if cbam_ready is not None:
        results = [s for s in results if s.get("cbam_ready") == cbam_ready]
    if verified is not None:
        results = [s for s in results if s.get("verified") == verified]

    # Calculate summary
    total_scope3 = sum(s.get("annual_emissions", 0) for s in suppliers_db)
    high_risk_count = len(
        [s for s in suppliers_db if s.get("risk_level") in ["high", "critical"]]
    )
    not_ready_count = len([s for s in suppliers_db if not s.get("cbam_ready")])

    return {
        "success": True,
        "suppliers": results,
        "summary": {
            "total_suppliers": len(suppliers_db),
            "total_scope3_emissions": total_scope3,
            "high_risk_count": high_risk_count,
            "not_cbam_ready_count": not_ready_count,
            "verified_count": len([s for s in suppliers_db if s.get("verified")]),
        },
    }


@router.get("/{supplier_id}")
async def get_supplier(supplier_id: int):
    """Get supplier by ID"""
    for supplier in suppliers_db:
        if supplier["id"] == supplier_id:
            return {"success": True, "supplier": supplier}
    raise HTTPException(status_code=404, detail="Supplier not found")


@router.post("/")
async def create_supplier(supplier: SupplierCreate):
    """Create a new supplier"""
    new_id = max(s["id"] for s in suppliers_db) + 1 if suppliers_db else 1

    new_supplier = {
        "id": new_id,
        **supplier.model_dump(),
        "cbam_ready": False,
        "has_emission_report": False,
        "has_cbam_certificate": False,
        "verified": False,
        "created_at": datetime.now().isoformat(),
    }

    suppliers_db.append(new_supplier)
    return {"success": True, "supplier": new_supplier}


@router.put("/{supplier_id}")
async def update_supplier(supplier_id: int, update: SupplierUpdate):
    """Update a supplier"""
    for i, supplier in enumerate(suppliers_db):
        if supplier["id"] == supplier_id:
            update_data = update.model_dump(exclude_unset=True)
            suppliers_db[i] = {**supplier, **update_data}
            return {"success": True, "supplier": suppliers_db[i]}

    raise HTTPException(status_code=404, detail="Supplier not found")


@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: int):
    """Delete a supplier"""
    global suppliers_db
    for i, supplier in enumerate(suppliers_db):
        if supplier["id"] == supplier_id:
            suppliers_db.pop(i)
            return {"success": True, "message": "Supplier deleted"}

    raise HTTPException(status_code=404, detail="Supplier not found")


@router.post("/{supplier_id}/verify")
async def verify_supplier(supplier_id: int):
    """Mark supplier as verified"""
    for supplier in suppliers_db:
        if supplier["id"] == supplier_id:
            supplier["verified"] = True
            return {"success": True, "message": "Supplier verified"}

    raise HTTPException(status_code=404, detail="Supplier not found")


@router.get("/risk/summary")
async def get_risk_summary():
    """Get supplier risk summary"""
    risk_counts = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for supplier in suppliers_db:
        risk = supplier.get("risk_level", "medium")
        if risk in risk_counts:
            risk_counts[risk] += 1

    return {
        "success": True,
        "risk_counts": risk_counts,
        "total_scope3_emissions": sum(
            s.get("annual_emissions", 0) for s in suppliers_db
        ),
        "recommendations": (
            [
                "Yüksek riskli tedarikçilerden emisyon raporları talep edin",
                "CBAM sertifikası olmayan tedarikçileri değerlendirin",
                "Alternatif düşük karbonlu tedarikçiler araştırın",
            ]
            if risk_counts["high"] + risk_counts["critical"] > 0
            else []
        ),
    }
