from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base


class CBAMCategory(str, enum.Enum):
    IRON = "Iron"
    STEEL = "Steel"
    ALUMINIUM = "Aluminium"
    CEMENT = "Cement"
    FERTILIZERS = "Fertilizers"
    HYDROGEN = "Hydrogen"
    ELECTRICITY = "Electricity"


class RiskLevel(str, enum.Enum):
    VERY_LOW = "VeryLow"
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    tax_number = Column(String(20), unique=True, index=True)
    sector = Column(String(100))
    sub_sector = Column(String(100))
    city = Column(String(100))
    employee_count = Column(Integer, default=0)
    annual_revenue = Column(Float, default=0)
    annual_eu_export = Column(Float, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    products = relationship(
        "CBAMProduct", back_populates="company", cascade="all, delete-orphan"
    )
    emissions = relationship(
        "EmissionRecord", back_populates="company", cascade="all, delete-orphan"
    )
    projects = relationship(
        "Project", back_populates="company", cascade="all, delete-orphan"
    )
    events = relationship(
        "Event", back_populates="company", cascade="all, delete-orphan"
    )
    compliance_statuses = relationship(
        "CompanyCompliance", back_populates="company", cascade="all, delete-orphan"
    )
    notifications = relationship(
        "Notification", back_populates="company", cascade="all, delete-orphan"
    )
    users = relationship("User", back_populates="company")
    scenarios = relationship("CarbonPriceScenario", back_populates="company")


class CBAMProduct(Base):
    __tablename__ = "cbam_products"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(200), nullable=False)
    hs_code = Column(String(20))
    cn_code = Column(String(20))
    category = Column(String(50))
    annual_production_tons = Column(Float, default=0)
    eu_export_tons = Column(Float, default=0)
    embedded_emissions_per_ton = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="products")

    @property
    def total_embedded_emissions(self) -> float:
        return self.eu_export_tons * self.embedded_emissions_per_ton


class EmissionRecord(Base):
    __tablename__ = "emission_records"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    year = Column(Integer, nullable=False)
    period = Column(String(50), default="Yıllık")
    scope1_emissions = Column(Float, default=0)  # tCO2e
    scope2_emissions = Column(Float, default=0)
    scope3_emissions = Column(Float, default=0)
    emission_intensity = Column(Float, default=0)  # tCO2e / milyon TL
    data_source = Column(String(100))
    is_verified = Column(Boolean, default=False)
    verified_by = Column(String(200))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="emissions")

    @property
    def total_emissions(self) -> float:
        return self.scope1_emissions + self.scope2_emissions + self.scope3_emissions


class ProjectStatus(str, enum.Enum):
    PLANNED = "Planned"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    ON_HOLD = "On Hold"
    CANCELLED = "Cancelled"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(String(500))
    status = Column(String(50), default=ProjectStatus.PLANNED.value)
    progress = Column(Integer, default=0)
    budget = Column(Float, default=0)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    manager = Column(String(100))

    # Impact metrics
    emission_reduction_Target = Column(Float, default=0)  # tCO2e
    cost_saving_target = Column(Float, default=0)  # Currency

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="projects")


class EventCategory(str, enum.Enum):
    MEETING = "Meeting"
    AUDIT = "Audit"
    DEADLINE = "Deadline"
    REVIEW = "Review"
    TRAINING = "Training"
    OTHER = "Other"


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(String(500))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    location = Column(String(200))
    category = Column(String(50), default=EventCategory.MEETING.value)
    is_all_day = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="events")


class ComplianceCategory(str, enum.Enum):
    REGISTRATION = "Registration"
    EMISSION = "Emission"
    SUPPLIER = "Supplier"
    FINANCIAL = "Financial"
    CERTIFICATION = "Certification"


class ComplianceItem(Base):
    __tablename__ = "compliance_items"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)
    title = Column(String(300), nullable=False)  # English title
    title_tr = Column(String(300), nullable=False)  # Turkish title
    description = Column(String(500))
    deadline = Column(DateTime)
    priority = Column(String(20), default="Medium")  # High, Medium, Low

    # Relationships
    company_statuses = relationship("CompanyCompliance", back_populates="item")


class CompanyCompliance(Base):
    __tablename__ = "company_compliance"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("compliance_items.id"), nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(String(500))

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="compliance_statuses")
    item = relationship("ComplianceItem", back_populates="company_statuses")


class NotificationType(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    SUCCESS = "success"
    ERROR = "error"
    DEADLINE = "deadline"
    SYSTEM = "system"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=True
    )  # Public notifications can be null
    company_id = Column(
        Integer, ForeignKey("companies.id"), nullable=True
    )  # Company wide notifications
    type = Column(String(50), default=NotificationType.INFO.value)
    title = Column(String(200), nullable=False)
    message = Column(String(500), nullable=False)
    is_read = Column(Boolean, default=False)
    action_url = Column(String(500))
    icon = Column(String(50))  # Emoji or icon name

    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="notifications")
    company = relationship("Company", back_populates="notifications")
