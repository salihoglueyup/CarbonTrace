"""
Export API Routes - PDF and Excel report downloads
"""

from fastapi import APIRouter, Query, Response
from fastapi.responses import StreamingResponse
from typing import Optional
from datetime import datetime
import io

from app.services.export_service import export_service

router = APIRouter()


@router.get("/pdf/{report_type}")
async def export_pdf(
    report_type: str,
    company_id: Optional[int] = Query(None),
    title: Optional[str] = Query(None),
):
    """Export a report as PDF"""

    # Sample data - in production this would come from database
    data = _get_sample_data(report_type)

    try:
        pdf_bytes = await export_service.generate_pdf(
            report_type=report_type, data=data, title=title
        )

        filename = f"cbam_guard_{report_type}_{datetime.now().strftime('%Y%m%d')}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    except ImportError as e:
        return {"error": str(e), "message": "PDF generation library not installed"}
    except Exception as e:
        return {"error": str(e), "message": "Failed to generate PDF"}


@router.get("/excel/{report_type}")
async def export_excel(
    report_type: str,
    company_id: Optional[int] = Query(None),
    title: Optional[str] = Query(None),
):
    """Export a report as Excel"""

    # Sample data - in production this would come from database
    data = _get_sample_data(report_type)

    try:
        excel_bytes = await export_service.generate_excel(
            report_type=report_type, data=data, title=title
        )

        filename = f"cbam_guard_{report_type}_{datetime.now().strftime('%Y%m%d')}.xlsx"

        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    except ImportError as e:
        return {"error": str(e), "message": "Excel generation library not installed"}
    except Exception as e:
        return {"error": str(e), "message": "Failed to generate Excel"}


def _get_sample_data(report_type: str) -> dict:
    """Get sample data for reports"""

    if report_type == "emission":
        return {
            "total_emissions": "289,000 tCO2e",
            "scope1": "145,000 tCO2e",
            "scope2": "89,000 tCO2e",
            "scope3": "55,000 tCO2e",
            "total": 289000,
        }
    elif report_type == "cbam":
        return {
            "conservative_cost": "€5,800,000",
            "moderate_cost": "€7,500,000",
            "aggressive_cost": "€9,800,000",
            "conservative": 5800000,
            "moderate": 7500000,
            "aggressive": 9800000,
        }
    else:
        return {
            "credits": [
                {"name": "Yeşil Enerji Kredisi", "rate": 1.49, "term": 84},
                {"name": "Enerji Verimliliği Kredisi", "rate": 1.79, "term": 60},
                {"name": "Temiz Teknoloji Kredisi", "rate": 1.99, "term": 72},
            ]
        }
