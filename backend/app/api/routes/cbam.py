from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.db.database import get_db
from app.models.models import CBAMProduct, Company, EmissionRecord

router = APIRouter()


# ============================
# Pydantic Models
# ============================


class CBAMProductResponse(BaseModel):
    id: int
    company_id: int
    company_name: Optional[str] = None
    name: str
    hs_code: Optional[str] = None
    cn_code: Optional[str] = None
    category: str
    annual_production_tons: float
    eu_export_tons: float
    embedded_emissions_per_ton: float
    total_embedded_emissions: float


class CBAMProductCreate(BaseModel):
    company_id: int
    name: str
    hs_code: Optional[str] = None
    cn_code: Optional[str] = None
    category: str
    annual_production_tons: float
    eu_export_tons: float
    embedded_emissions_per_ton: float


class CBAMRates(BaseModel):
    current_carbon_price: float
    currency: str
    phase_in_rate: float
    effective_from: str
    next_phase: Optional[str] = None
    next_phase_rate: Optional[float] = None


class SimpleCBAMCalculation(BaseModel):
    emissions: float  # tCO2e
    carbon_price: Optional[float] = 90  # EUR/tCO2
    phase_in_rate: Optional[float] = 0.025  # Current rate


class SimpleCBAMResult(BaseModel):
    gross_cost: float
    net_cost: float
    carbon_price: float
    phase_in_rate: float
    emissions: float
    notes: str


class CategoryBreakdown(BaseModel):
    category: str
    product_count: int
    total_exports_tons: float
    total_embedded_emissions: float
    estimated_cost: float


# ============================
# Endpoints
# ============================


@router.get("/products", response_model=List[CBAMProductResponse])
def get_cbam_products(
    company_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """CBAM ürün listesi"""
    query = db.query(CBAMProduct)

    if company_id:
        query = query.filter(CBAMProduct.company_id == company_id)

    if category:
        query = query.filter(CBAMProduct.category == category)

    products = query.all()

    result = []
    for p in products:
        company = db.query(Company).filter(Company.id == p.company_id).first()
        result.append(
            CBAMProductResponse(
                id=p.id,
                company_id=p.company_id,
                company_name=company.name if company else None,
                name=p.name,
                hs_code=p.hs_code,
                cn_code=p.cn_code,
                category=p.category or "Bilinmiyor",
                annual_production_tons=p.annual_production_tons,
                eu_export_tons=p.eu_export_tons,
                embedded_emissions_per_ton=p.embedded_emissions_per_ton,
                total_embedded_emissions=p.eu_export_tons
                * p.embedded_emissions_per_ton,
            )
        )

    return result


@router.get("/products/{product_id}", response_model=CBAMProductResponse)
def get_cbam_product(product_id: int, db: Session = Depends(get_db)):
    """Tek bir CBAM ürünü"""
    product = db.query(CBAMProduct).filter(CBAMProduct.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    company = db.query(Company).filter(Company.id == product.company_id).first()

    return CBAMProductResponse(
        id=product.id,
        company_id=product.company_id,
        company_name=company.name if company else None,
        name=product.name,
        hs_code=product.hs_code,
        cn_code=product.cn_code,
        category=product.category or "Bilinmiyor",
        annual_production_tons=product.annual_production_tons,
        eu_export_tons=product.eu_export_tons,
        embedded_emissions_per_ton=product.embedded_emissions_per_ton,
        total_embedded_emissions=product.eu_export_tons
        * product.embedded_emissions_per_ton,
    )


@router.post("/products", response_model=CBAMProductResponse)
def create_cbam_product(product: CBAMProductCreate, db: Session = Depends(get_db)):
    """Yeni CBAM ürünü oluştur"""

    company = db.query(Company).filter(Company.id == product.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    new_product = CBAMProduct(
        company_id=product.company_id,
        name=product.name,
        hs_code=product.hs_code,
        cn_code=product.cn_code,
        category=product.category,
        annual_production_tons=product.annual_production_tons,
        eu_export_tons=product.eu_export_tons,
        embedded_emissions_per_ton=product.embedded_emissions_per_ton,
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return CBAMProductResponse(
        id=new_product.id,
        company_id=new_product.company_id,
        company_name=company.name,
        name=new_product.name,
        hs_code=new_product.hs_code,
        cn_code=new_product.cn_code,
        category=new_product.category or "Bilinmiyor",
        annual_production_tons=new_product.annual_production_tons,
        eu_export_tons=new_product.eu_export_tons,
        embedded_emissions_per_ton=new_product.embedded_emissions_per_ton,
        total_embedded_emissions=new_product.eu_export_tons
        * new_product.embedded_emissions_per_ton,
    )


@router.get("/rates", response_model=CBAMRates)
def get_cbam_rates():
    """Güncel CBAM oranları ve karbon fiyatı"""
    return CBAMRates(
        current_carbon_price=90.0,  # EUR/tCO2e - would come from EU ETS API in production
        currency="EUR",
        phase_in_rate=0.025,  # 2.5% for 2026
        effective_from="2026-01-01",
        next_phase="2027-01-01",
        next_phase_rate=0.05,
    )


@router.get("/categories")
def get_cbam_categories():
    """CBAM kategorileri"""
    return {
        "categories": [
            {
                "code": "Steel",
                "name": "Çelik",
                "description": "Demir ve çelik ürünleri",
            },
            {
                "code": "Aluminium",
                "name": "Alüminyum",
                "description": "Alüminyum ve alüminyum ürünleri",
            },
            {"code": "Cement", "name": "Çimento", "description": "Çimento ve klinker"},
            {"code": "Fertilizers", "name": "Gübre", "description": "Azotlu gübreler"},
            {"code": "Hydrogen", "name": "Hidrojen", "description": "Hidrojen"},
            {"code": "Electricity", "name": "Elektrik", "description": "Elektrik"},
        ]
    }


@router.post("/calculate-simple", response_model=SimpleCBAMResult)
def calculate_simple_cbam(calc: SimpleCBAMCalculation):
    """Basit CBAM maliyet hesabı"""

    gross_cost = calc.emissions * calc.carbon_price
    net_cost = gross_cost * calc.phase_in_rate

    return SimpleCBAMResult(
        gross_cost=round(gross_cost, 2),
        net_cost=round(net_cost, 2),
        carbon_price=calc.carbon_price,
        phase_in_rate=calc.phase_in_rate,
        emissions=calc.emissions,
        notes=f"Phase-in oranı %{calc.phase_in_rate * 100:.1f}. Tam uygulama 2034'te başlayacak.",
    )


@router.get("/category-breakdown", response_model=List[CategoryBreakdown])
def get_category_breakdown(db: Session = Depends(get_db)):
    """Kategori bazlı CBAM özeti"""

    products = db.query(CBAMProduct).all()

    category_data = {}

    for product in products:
        category = product.category or "Diğer"

        if category not in category_data:
            category_data[category] = {"count": 0, "exports": 0, "emissions": 0}

        category_data[category]["count"] += 1
        category_data[category]["exports"] += product.eu_export_tons
        category_data[category]["emissions"] += (
            product.eu_export_tons * product.embedded_emissions_per_ton
        )

    result = []
    carbon_price = 90  # EUR/tCO2e
    phase_in_rate = 0.025

    for category, data in category_data.items():
        cost = data["emissions"] * carbon_price * phase_in_rate
        result.append(
            CategoryBreakdown(
                category=category,
                product_count=data["count"],
                total_exports_tons=round(data["exports"], 0),
                total_embedded_emissions=round(data["emissions"], 0),
                estimated_cost=round(cost, 0),
            )
        )

    result.sort(key=lambda x: x.estimated_cost, reverse=True)
    return result


@router.get("/company-summary/{company_id}")
def get_company_cbam_summary(company_id: int, db: Session = Depends(get_db)):
    """Şirket CBAM özeti"""

    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    products = db.query(CBAMProduct).filter(CBAMProduct.company_id == company_id).all()

    total_exports = sum(p.eu_export_tons for p in products)
    total_emissions = sum(
        p.eu_export_tons * p.embedded_emissions_per_ton for p in products
    )

    carbon_price = 90
    phase_in_rate = 0.025
    estimated_cost = total_emissions * carbon_price * phase_in_rate
    full_cost = total_emissions * carbon_price

    return {
        "company_id": company.id,
        "company_name": company.name,
        "product_count": len(products),
        "total_eu_exports_tons": round(total_exports, 0),
        "total_embedded_emissions": round(total_emissions, 0),
        "current_cbam_cost": round(estimated_cost, 0),
        "full_cbam_cost_2034": round(full_cost, 0),
        "carbon_price": carbon_price,
        "phase_in_rate": phase_in_rate,
        "products": [
            {
                "name": p.name,
                "category": p.category,
                "exports": p.eu_export_tons,
                "emissions": round(p.eu_export_tons * p.embedded_emissions_per_ton, 0),
            }
            for p in products
        ],
    }
