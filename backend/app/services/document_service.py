"""
Document Service - PDF/Excel file parsing and analysis
"""

import os
import re
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio


class DocumentService:
    """Service for parsing and analyzing uploaded documents"""

    UPLOAD_DIR = "uploads"
    ALLOWED_EXTENSIONS = {".pdf", ".xlsx", ".xls", ".csv"}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

    def __init__(self):
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)

    def validate_file(self, filename: str, file_size: int) -> tuple[bool, str]:
        """Validate uploaded file"""
        ext = os.path.splitext(filename)[1].lower()

        if ext not in self.ALLOWED_EXTENSIONS:
            return (
                False,
                f"Geçersiz dosya türü. İzin verilen: {', '.join(self.ALLOWED_EXTENSIONS)}",
            )

        if file_size > self.MAX_FILE_SIZE:
            return (
                False,
                f"Dosya çok büyük. Maksimum: {self.MAX_FILE_SIZE // (1024*1024)}MB",
            )

        return True, ""

    async def save_file(self, filename: str, content: bytes) -> str:
        """Save uploaded file and return path"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(self.UPLOAD_DIR, safe_filename)

        with open(filepath, "wb") as f:
            f.write(content)

        return filepath

    async def parse_pdf(self, filepath: str) -> Dict[str, Any]:
        """Parse PDF file and extract emission data"""
        try:
            from PyPDF2 import PdfReader
        except ImportError:
            return {"error": "PyPDF2 not installed"}

        try:
            reader = PdfReader(filepath)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""

            # Extract emission-related data
            extracted = self._extract_emission_data(text)

            return {
                "success": True,
                "filename": os.path.basename(filepath),
                "pages": len(reader.pages),
                "text_length": len(text),
                "extracted_data": extracted,
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def parse_excel(self, filepath: str) -> Dict[str, Any]:
        """Parse Excel file and extract data"""
        try:
            import pandas as pd
        except ImportError:
            return {"error": "pandas not installed"}

        try:
            # Read all sheets
            excel_file = pd.ExcelFile(filepath)
            sheets_data = {}

            for sheet_name in excel_file.sheet_names:
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                sheets_data[sheet_name] = {
                    "rows": len(df),
                    "columns": list(df.columns),
                    "preview": df.head(5).to_dict("records"),
                }

            # Try to extract emission data
            extracted = self._extract_excel_emission_data(excel_file)

            return {
                "success": True,
                "filename": os.path.basename(filepath),
                "sheets": list(excel_file.sheet_names),
                "sheets_data": sheets_data,
                "extracted_data": extracted,
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def parse_csv(self, filepath: str) -> Dict[str, Any]:
        """Parse CSV file"""
        try:
            import pandas as pd
        except ImportError:
            return {"error": "pandas not installed"}

        try:
            df = pd.read_csv(filepath)

            return {
                "success": True,
                "filename": os.path.basename(filepath),
                "rows": len(df),
                "columns": list(df.columns),
                "preview": df.head(10).to_dict("records"),
                "extracted_data": self._analyze_csv_for_emissions(df),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def _extract_emission_data(self, text: str) -> Dict[str, Any]:
        """Extract emission-related data from text"""
        data = {
            "emissions_found": [],
            "companies_mentioned": [],
            "dates_found": [],
            "financial_data": [],
        }

        # Look for emission patterns (numbers followed by tCO2, kgCO2, etc.)
        emission_pattern = r"(\d+[.,]?\d*)\s*(tCO2e?|kgCO2|ton\s*CO2|karbon)"
        emissions = re.findall(emission_pattern, text, re.IGNORECASE)
        data["emissions_found"] = [
            {"value": e[0], "unit": e[1]} for e in emissions[:10]
        ]

        # Look for currency amounts
        currency_pattern = r"(€|EUR|TL|₺|USD|\$)\s*(\d+[.,]?\d*(?:[.,]\d+)?(?:\s*(?:milyon|million|M|bin|K))?)"
        currencies = re.findall(currency_pattern, text, re.IGNORECASE)
        data["financial_data"] = [
            {"currency": c[0], "amount": c[1]} for c in currencies[:10]
        ]

        # Look for dates
        date_pattern = r"\d{1,2}[./]\d{1,2}[./]\d{2,4}"
        dates = re.findall(date_pattern, text)
        data["dates_found"] = dates[:10]

        # Check for scope mentions
        scope_pattern = r"(scope\s*[123]|kapsam\s*[123])"
        scopes = re.findall(scope_pattern, text, re.IGNORECASE)
        data["scopes_mentioned"] = list(set(s.lower() for s in scopes))

        return data

    def _extract_excel_emission_data(self, excel_file) -> Dict[str, Any]:
        """Extract emission data from Excel"""
        import pandas as pd

        extracted = {"total_emissions": None, "by_scope": {}, "by_company": {}}

        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)

            # Look for emission-related columns
            for col in df.columns:
                col_lower = str(col).lower()
                if any(
                    word in col_lower
                    for word in ["emisyon", "emission", "co2", "karbon"]
                ):
                    try:
                        total = df[col].sum()
                        if pd.notna(total) and total > 0:
                            extracted["total_emissions"] = float(total)
                    except:
                        pass

                # Check for scope columns
                if "scope" in col_lower or "kapsam" in col_lower:
                    for scope in ["1", "2", "3"]:
                        if scope in col_lower:
                            try:
                                extracted["by_scope"][f"scope{scope}"] = float(
                                    df[col].sum()
                                )
                            except:
                                pass

        return extracted

    def _analyze_csv_for_emissions(self, df) -> Dict[str, Any]:
        """Analyze CSV for emission data"""
        analysis = {
            "numeric_columns": [],
            "potential_emission_columns": [],
            "summary": {},
        }

        for col in df.columns:
            col_lower = str(col).lower()

            # Check if numeric
            if df[col].dtype in ["int64", "float64"]:
                analysis["numeric_columns"].append(col)

                # Check if emission-related
                if any(
                    word in col_lower
                    for word in ["emisyon", "emission", "co2", "karbon", "carbon"]
                ):
                    analysis["potential_emission_columns"].append(col)
                    analysis["summary"][col] = {
                        "sum": float(df[col].sum()),
                        "mean": float(df[col].mean()),
                        "min": float(df[col].min()),
                        "max": float(df[col].max()),
                    }

        return analysis

    async def analyze_document(self, filepath: str) -> Dict[str, Any]:
        """Analyze document based on type"""
        ext = os.path.splitext(filepath)[1].lower()

        if ext == ".pdf":
            return await self.parse_pdf(filepath)
        elif ext in [".xlsx", ".xls"]:
            return await self.parse_excel(filepath)
        elif ext == ".csv":
            return await self.parse_csv(filepath)
        else:
            return {"error": f"Unsupported file type: {ext}"}


# Global instance
document_service = DocumentService()
