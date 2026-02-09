from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Boolean,
    Enum,
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.database import Base


class ScenarioType(str, enum.Enum):
    PRICE_INCREASE = "price_increase"
    PRODUCTION_INCREASE = "production_increase"
    INVESTMENT_ROI = "investment_roi"
    CUSTOM = "custom"


class CarbonPriceScenario(Base):
    __tablename__ = "carbon_price_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    scenario_type = Column(Enum(ScenarioType), default=ScenarioType.CUSTOM)

    # Parameters
    base_carbon_price = Column(Float)  # Current or starting price
    target_carbon_price = Column(Float)  # Future price
    price_increase_rate = Column(Float)  # Annual increase %

    company_id = Column(Integer, ForeignKey("companies.id"))
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="scenarios")
    created_by = relationship("User", back_populates="scenarios")


class FinancialProjection(Base):
    __tablename__ = "financial_projections"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer)
    quarter = Column(Integer, nullable=True)

    projected_emissions = Column(Float)  # Tonnes CO2e
    projected_carbon_price = Column(Float)  # EUR/Ton
    projected_cost = Column(Float)  # EUR

    scenario_id = Column(Integer, ForeignKey("carbon_price_scenarios.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    scenario = relationship("CarbonPriceScenario")
    company = relationship("Company")
