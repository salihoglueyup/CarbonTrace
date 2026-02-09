"""
Supplier Model and Routes
Tedarik zinciri yönetimi için
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Boolean,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.database import Base


class SupplierRiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Supplier(Base):
    """Supplier/Tedarikçi modeli"""

    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    country = Column(String(100), default="Türkiye")
    sector = Column(String(100))
    contact_email = Column(String(255))
    contact_phone = Column(String(50))

    # Emission data
    annual_emissions = Column(Float, default=0)  # tCO2e
    scope3_contribution = Column(Float, default=0)  # Percentage
    emission_intensity = Column(Float)  # tCO2e per unit

    # Risk assessment
    risk_level = Column(String(20), default="medium")
    cbam_ready = Column(Boolean, default=False)
    last_audit_date = Column(DateTime)

    # Compliance
    has_emission_report = Column(Boolean, default=False)
    has_cbam_certificate = Column(Boolean, default=False)
    verified = Column(Boolean, default=False)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
