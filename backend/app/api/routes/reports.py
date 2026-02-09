from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.db.database import get_db
from app.models.models import Company, EmissionRecord, CBAMProduct
from app.models.supplier import Supplier

router = APIRouter()


# ============================
# Pydantic Models
# ============================


class ReportSummary(BaseModel):
    id: int
    name: str
    type: str
    status: str
    created_at: str
    company_name: Optional[str] = None
    period: Optional[str] = None
    download_url: Optional[str] = None


class ReportGenerate(BaseModel):
    report_type: str  # emissions, cbam, compliance, supplier
    company_id: Optional[int] = None
    year: Optional[int] = None
    format: str = "pdf"  # pdf, excel, csv


class ComprehensiveReport(BaseModel):
    report_id: str
    generated_at: str
    report_type: str
    company: Optional[dict] = None
    emissions: Optional[dict] = None
    cbam: Optional[dict] = None
    suppliers: Optional[dict] = None
    recommendations: List[str] = []


# Simulated report storage (in production would be a DB table)
_generated_reports = []


# ============================
# Endpoints
# ============================


@router.get("/", response_model=List[ReportSummary])
def get_reports():
    """Mevcut raporlar listesi"""

    # Default reports + generated ones
    default_reports = [
        ReportSummary(
            id=1,
            name="2024 Yıllık Emisyon Raporu",
            type="emissions",
            status="completed",
            created_at="2024-12-15",
            period="2024",
        ),
        ReportSummary(
            id=2,
            name="CBAM Uyum Raporu Q4 2024",
            type="cbam",
            status="completed",
            created_at="2024-12-20",
            period="Q4 2024",
        ),
        ReportSummary(
            id=3,
            name="Tedarikçi Risk Değerlendirmesi",
            type="supplier",
            status="completed",
            created_at="2024-12-10",
            period="2024",
        ),
        ReportSummary(
            id=4,
            name="2025 CBAM Maliyet Projeksiyonu",
            type="cbam",
            status="draft",
            created_at="2025-01-05",
            period="2025",
        ),
    ]

    return default_reports + _generated_reports


@router.get("/types")
def get_report_types():
    """Mevcut rapor türleri"""
    return {
        "types": [
            {
                "code": "emissions",
                "name": "Emisyon Raporu",
                "description": "Yıllık/dönemlik emisyon analizi",
            },
            {
                "code": "cbam",
                "name": "CBAM Raporu",
                "description": "CBAM uyumluluk ve maliyet raporu",
            },
            {
                "code": "compliance",
                "name": "Uyum Raporu",
                "description": "Regülasyon uyum durumu",
            },
            {
                "code": "supplier",
                "name": "Tedarikçi Raporu",
                "description": "Tedarikçi risk değerlendirmesi",
            },
            {
                "code": "combined",
                "name": "Kapsamlı Rapor",
                "description": "Tüm verileri içeren genel rapor",
            },
        ]
    }


@router.post("/generate", response_model=ComprehensiveReport)
def generate_report(request: ReportGenerate, db: Session = Depends(get_db)):
    """Yeni rapor oluştur"""

    report_id = f"RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    report = ComprehensiveReport(
        report_id=report_id,
        generated_at=datetime.now().isoformat(),
        report_type=request.report_type,
        recommendations=[],
    )

    # Gather company data if specified
    if request.company_id:
        company = db.query(Company).filter(Company.id == request.company_id).first()
        if company:
            report.company = {
                "id": company.id,
                "name": company.name,
                "sector": company.sector,
                "city": company.city,
                "annual_revenue": company.annual_revenue,
                "annual_eu_export": company.annual_eu_export,
            }

    # Emissions data
    if request.report_type in ["emissions", "combined"]:
        query = db.query(EmissionRecord)
        if request.company_id:
            query = query.filter(EmissionRecord.company_id == request.company_id)
        if request.year:
            query = query.filter(EmissionRecord.year == request.year)

        emissions = query.all()

        total_scope1 = sum(e.scope1_emissions for e in emissions)
        total_scope2 = sum(e.scope2_emissions for e in emissions)
        total_scope3 = sum(e.scope3_emissions for e in emissions)

        report.emissions = {
            "record_count": len(emissions),
            "scope1_total": total_scope1,
            "scope2_total": total_scope2,
            "scope3_total": total_scope3,
            "grand_total": total_scope1 + total_scope2 + total_scope3,
            "verified_records": len([e for e in emissions if e.is_verified]),
            "year_breakdown": {},
        }

        # Add year breakdown
        year_data = {}
        for e in emissions:
            if e.year not in year_data:
                year_data[e.year] = 0
            year_data[e.year] += (
                e.scope1_emissions + e.scope2_emissions + e.scope3_emissions
            )
        report.emissions["year_breakdown"] = year_data

        report.recommendations.append(
            "Scope 1 emisyonlarını azaltmak için enerji verimliliği projelerine yatırım yapın"
        )

    # CBAM data
    if request.report_type in ["cbam", "combined"]:
        query = db.query(CBAMProduct)
        if request.company_id:
            query = query.filter(CBAMProduct.company_id == request.company_id)

        products = query.all()

        total_exports = sum(p.eu_export_tons for p in products)
        total_embedded = sum(
            p.eu_export_tons * p.embedded_emissions_per_ton for p in products
        )

        carbon_price = 90
        phase_in_rate = 0.025

        report.cbam = {
            "product_count": len(products),
            "total_eu_exports_tons": total_exports,
            "total_embedded_emissions": total_embedded,
            "current_cbam_cost": total_embedded * carbon_price * phase_in_rate,
            "full_cbam_cost_2034": total_embedded * carbon_price,
            "carbon_price_eur": carbon_price,
            "phase_in_rate": phase_in_rate,
            "category_breakdown": {},
        }

        # Category breakdown
        cat_data = {}
        for p in products:
            cat = p.category or "Diğer"
            if cat not in cat_data:
                cat_data[cat] = {"products": 0, "emissions": 0}
            cat_data[cat]["products"] += 1
            cat_data[cat]["emissions"] += (
                p.eu_export_tons * p.embedded_emissions_per_ton
            )
        report.cbam["category_breakdown"] = cat_data

        report.recommendations.append(
            "CBAM sertifikalı tedarikçilerle çalışarak maliyetleri azaltın"
        )

    # Supplier data
    if request.report_type in ["supplier", "combined"]:
        suppliers = db.query(Supplier).all()

        report.suppliers = {
            "total_count": len(suppliers),
            "verified_count": len([s for s in suppliers if s.verified]),
            "cbam_ready_count": len([s for s in suppliers if s.cbam_ready]),
            "high_risk_count": len(
                [s for s in suppliers if s.risk_level in ["high", "critical"]]
            ),
            "by_country": {},
            "by_risk": {},
        }

        # Country breakdown
        country_data = {}
        for s in suppliers:
            country = s.country or "Bilinmiyor"
            if country not in country_data:
                country_data[country] = 0
            country_data[country] += 1
        report.suppliers["by_country"] = country_data

        # Risk breakdown
        risk_data = {}
        for s in suppliers:
            risk = s.risk_level or "medium"
            if risk not in risk_data:
                risk_data[risk] = 0
            risk_data[risk] += 1
        report.suppliers["by_risk"] = risk_data

        report.recommendations.append(
            "Yüksek riskli tedarikçiler için alternatif kaynak planlaması yapın"
        )

    # Store the generated report
    _generated_reports.append(
        ReportSummary(
            id=len(_generated_reports) + 100,
            name=f"{request.report_type.upper()} Raporu - {datetime.now().strftime('%Y-%m-%d')}",
            type=request.report_type,
            status="completed",
            created_at=datetime.now().strftime("%Y-%m-%d"),
        )
    )

    return report


@router.get("/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    """Rapor özet istatistikleri"""

    companies = db.query(Company).filter(Company.is_active == True).count()
    emissions = db.query(EmissionRecord).count()
    products = db.query(CBAMProduct).count()
    suppliers = db.query(Supplier).count()

    return {
        "data_coverage": {
            "companies": companies,
            "emission_records": emissions,
            "cbam_products": products,
            "suppliers": suppliers,
        },
        "available_reports": 4 + len(_generated_reports),
        "last_generated": (
            datetime.now().strftime("%Y-%m-%d") if _generated_reports else None
        ),
        "export_formats": ["pdf", "excel", "csv"],
    }
