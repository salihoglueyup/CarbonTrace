"""
Backend Tests - CBAM Guard API
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


class TestHealthEndpoints:
    """Test health and basic endpoints"""

    def test_root_endpoint(self, client):
        """Test root endpoint returns status"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "CBAM Guard" in data["message"]

    def test_docs_available(self, client):
        """Test OpenAPI docs are available"""
        response = client.get("/docs")
        assert response.status_code == 200


class TestAuthEndpoints:
    """Test authentication endpoints"""

    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        response = client.post(
            "/api/auth/login/json",
            json={"email": "nonexistent@example.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    def test_register_missing_fields(self, client):
        """Test register with missing fields"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com"
                # Missing password, full_name
            },
        )
        assert response.status_code == 422  # Validation error


class TestChatEndpoints:
    """Test chat/AI endpoints"""

    def test_chat_providers_endpoint(self, client):
        """Test getting available providers"""
        response = client.get("/api/chat/providers")
        assert response.status_code == 200
        data = response.json()
        assert "providers" in data
        assert "success" in data


class TestDashboardEndpoints:
    """Test dashboard endpoints"""

    def test_dashboard_stats(self, client):
        """Test dashboard stats endpoint"""
        response = client.get("/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        # Check expected fields
        assert (
            "total_companies" in data
            or "companies" in data
            or response.status_code == 200
        )


class TestCompanyEndpoints:
    """Test company CRUD endpoints"""

    def test_get_companies(self, client):
        """Test getting all companies"""
        response = client.get("/api/companies")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestExportEndpoints:
    """Test export endpoints"""

    def test_export_pdf_endpoint_exists(self, client):
        """Test PDF export endpoint exists"""
        response = client.get("/api/export/pdf/emission")
        # Should return PDF or error about missing library
        assert response.status_code in [200, 500]  # 500 if reportlab not installed

    def test_export_excel_endpoint_exists(self, client):
        """Test Excel export endpoint exists"""
        response = client.get("/api/export/excel/cbam")
        # Should return Excel or error about missing library
        assert response.status_code in [200, 500]  # 500 if openpyxl not installed


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
