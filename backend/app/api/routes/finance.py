from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.db.database import get_db
from app.models.finance import CarbonPriceScenario, FinancialProjection, ScenarioType
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter()

# ============ Schemas ============


class ScenarioCreate(BaseModel):
    name: str
    description: Optional[str] = None
    scenario_type: ScenarioType
    base_carbon_price: float
    target_carbon_price: float
    price_increase_rate: float
    company_id: int


class ScenarioResponse(BaseModel):
    id: int
    name: str
    scenario_type: ScenarioType
    base_carbon_price: float
    target_carbon_price: float
    created_at: datetime

    class Config:
        from_attributes = True


class CalculationRequest(BaseModel):
    current_emissions: float
    current_carbon_price: float
    target_year: int
    annual_reduction_rate: float = 0.0  # % reducing emissions per year
    carbon_price_increase_rate: float = 0.05  # % price increase per year


class CalculationResult(BaseModel):
    year: int
    projected_emissions: float
    projected_price: float
    total_cost: float


# ============ Routes ============


@router.post("/calculate/projection", response_model=List[CalculationResult])
async def calculate_projection(
    request: CalculationRequest, current_user: User = Depends(get_current_user)
):
    """
    Calculate financial projection based on parameters (No DB save)
    """
    results = []
    current_year = datetime.now().year

    emissions = request.current_emissions
    price = request.current_carbon_price

    for year in range(current_year, request.target_year + 1):
        cost = emissions * price

        results.append(
            CalculationResult(
                year=year,
                projected_emissions=round(emissions, 2),
                projected_price=round(price, 2),
                total_cost=round(cost, 2),
            )
        )

        # Apply rates for next year
        emissions = emissions * (1 - request.annual_reduction_rate)
        price = price * (1 + request.carbon_price_increase_rate)

    return results


@router.get("/scenarios", response_model=List[ScenarioResponse])
async def get_scenarios(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scenarios = (
        db.query(CarbonPriceScenario)
        .filter(CarbonPriceScenario.company_id == company_id)
        .all()
    )
    return scenarios


@router.post("/scenarios", response_model=ScenarioResponse)
async def create_scenario(
    scenario: ScenarioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_scenario = CarbonPriceScenario(**scenario.dict(), created_by_id=current_user.id)
    db.add(new_scenario)
    db.commit()
    db.refresh(new_scenario)
    return new_scenario
