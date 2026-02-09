from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Enums
class CBAMCategory(str, Enum):
    IRON = "Iron"
    STEEL = "Steel"
    ALUMINIUM = "Aluminium"
    CEMENT = "Cement"
    FERTILIZERS = "Fertilizers"


class RiskLevel(str, Enum):
    VERY_LOW = "VeryLow"
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


# Company Schemas
class CBAMProductBase(BaseModel):
    name: str
    hs_code: Optional[str] = None
    cn_code: Optional[str] = None
    category: Optional[str] = None
    annual_production_tons: float = 0
    eu_export_tons: float = 0
    embedded_emissions_per_ton: float = 0


class CBAMProductResponse(CBAMProductBase):
    id: int
    company_id: int
    total_embedded_emissions: float = 0

    class Config:
        from_attributes = True


class EmissionRecordBase(BaseModel):
    year: int
    period: str = "Yıllık"
    scope1_emissions: float = 0
    scope2_emissions: float = 0
    scope3_emissions: float = 0
    emission_intensity: float = 0
    data_source: Optional[str] = None
    is_verified: bool = False
    verified_by: Optional[str] = None


class EmissionRecordResponse(EmissionRecordBase):
    id: int
    company_id: int
    total_emissions: float = 0

    class Config:
        from_attributes = True


class CompanyBase(BaseModel):
    name: str
    tax_number: Optional[str] = None
    sector: Optional[str] = None
    sub_sector: Optional[str] = None
    city: Optional[str] = None
    employee_count: int = 0
    annual_revenue: float = 0
    annual_eu_export: float = 0


class CompanyCreate(CompanyBase):
    pass


class CompanyResponse(CompanyBase):
    id: int
    is_active: bool = True
    created_at: datetime
    products: List[CBAMProductResponse] = []
    emissions: List[EmissionRecordResponse] = []

    class Config:
        from_attributes = True


class CompanyListResponse(BaseModel):
    id: int
    name: str
    sector: Optional[str]
    city: Optional[str]
    total_emissions: float = 0
    risk_level: str = "Medium"

    class Config:
        from_attributes = True


# Dashboard Schemas
class DashboardStats(BaseModel):
    total_companies: int
    total_emissions: float
    estimated_cbam_cost: float
    high_risk_count: int


class CompanySummary(BaseModel):
    id: int
    name: str
    sector: str
    emissions: float
    risk_progress: int
    risk_level: str


# Chat Schemas
class ChatMessage(BaseModel):
    message: str
    company_id: Optional[int] = None


class SuggestedAction(BaseModel):
    action_type: str
    label: str


class ChatResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
    suggested_actions: List[SuggestedAction] = []
    confidence_score: float = 1.0


# CBAM Schemas
class CBAMCalculationRequest(BaseModel):
    company_id: Optional[int] = None
    emissions: float = 20000
    eu_export: float = 5000000
    scenario: str = "Moderate"


class CBAMCalculationResponse(BaseModel):
    scenario: str
    carbon_price: float
    total_emissions: float
    gross_cbam_cost: float
    net_cbam_cost: float
    cost_to_revenue_ratio: float
    recommendations: List[str]


# Project Schemas
class ProjectStatus(str, Enum):
    PLANNED = "Planned"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    ON_HOLD = "On Hold"
    CANCELLED = "Cancelled"


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "Planned"
    progress: int = 0
    budget: float = 0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    manager: Optional[str] = None
    emission_reduction_Target: float = 0
    cost_saving_target: float = 0


class ProjectCreate(ProjectBase):
    company_id: int


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    budget: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    manager: Optional[str] = None
    emission_reduction_Target: Optional[float] = None
    cost_saving_target: Optional[float] = None


class ProjectResponse(ProjectBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Event Schemas
class EventCategory(str, Enum):
    MEETING = "Meeting"
    AUDIT = "Audit"
    DEADLINE = "Deadline"
    REVIEW = "Review"
    TRAINING = "Training"
    OTHER = "Other"


class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    location: Optional[str] = None
    category: str = "Meeting"
    is_all_day: bool = False


class EventCreate(EventBase):
    company_id: int


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    category: Optional[str] = None
    is_all_day: Optional[bool] = None


class EventResponse(EventBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Compliance Schemas
class ComplianceCategory(str, Enum):
    REGISTRATION = "Registration"
    EMISSION = "Emission"
    SUPPLIER = "Supplier"
    FINANCIAL = "Financial"
    CERTIFICATION = "Certification"


class ComplianceItemResponse(BaseModel):
    id: int
    category: str
    title: str
    title_tr: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: str

    class Config:
        from_attributes = True


class CompanyComplianceUpdate(BaseModel):
    is_completed: bool
    notes: Optional[str] = None


class CompanyComplianceResponse(BaseModel):
    id: int
    company_id: int
    item_id: int
    is_completed: bool
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class ComplianceStatusDetail(BaseModel):
    item: ComplianceItemResponse
    status: Optional[CompanyComplianceResponse] = None


# Notification Schemas
class NotificationType(str, Enum):
    INFO = "info"
    WARNING = "warning"
    SUCCESS = "success"
    ERROR = "error"
    DEADLINE = "deadline"
    SYSTEM = "system"


class NotificationBase(BaseModel):
    type: str = "info"
    title: str
    message: str
    action_url: Optional[str] = None
    icon: Optional[str] = None


class NotificationCreate(NotificationBase):
    user_id: Optional[int] = None
    company_id: Optional[int] = None


class NotificationResponse(NotificationBase):
    id: int
    user_id: Optional[int]
    company_id: Optional[int]
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime]

    class Config:
        from_attributes = True
