from app.agents.base import BaseAgent, AgentRequest, AgentResponse, AgentAction
from typing import List


class CostPredictionAgent(BaseAgent):
    """Maliyet Tahmin Ajanı"""

    CARBON_PRICES = {"Conservative": 80.0, "Moderate": 90.0, "Aggressive": 100.0}

    @property
    def name(self) -> str:
        return "CostPredictionAgent"

    @property
    def description(self) -> str:
        return "CBAM maliyetlerini tahmin eder."

    @property
    def capabilities(self) -> List[str]:
        return ["CBAM maliyet hesaplama", "Senaryo analizi"]

    async def process_internal(self, request: AgentRequest) -> AgentResponse:
        intent = request.intent.lower()

        if intent == "calculate_cbam_cost":
            emissions = self.get_parameter(request, "emissions", 20000.0)
            eu_export = self.get_parameter(request, "eu_export", 5000000.0)
            scenario = self.get_parameter(request, "scenario", "Moderate")

            carbon_price = self.CARBON_PRICES.get(scenario, 90.0)
            gross_cost = emissions * carbon_price
            cost_to_revenue = (gross_cost / eu_export) * 100 if eu_export > 0 else 0

            recommendations = [
                "Emisyon azaltım yatırımları değerlendirilmeli",
                "Yeşil kredi seçenekleri araştırılmalı",
            ]

            if cost_to_revenue > 5:
                recommendations.insert(
                    0, "⚠️ CBAM maliyeti yüksek - acil aksiyon gerekli"
                )

            return AgentResponse(
                success=True,
                message=f"CBAM Maliyet Tahmini ({scenario} senaryo): {gross_cost:,.0f} EUR/yıl. Bu miktar AB ihracatınızın %{cost_to_revenue:.2f}'sine denk gelmektedir.",
                data={
                    "Scenario": scenario,
                    "CarbonPrice": carbon_price,
                    "TotalEmissions": emissions,
                    "GrossCBAMCost": gross_cost,
                    "CostToRevenueRatio": cost_to_revenue,
                    "Recommendations": recommendations,
                },
                suggested_actions=[
                    AgentAction("run_scenario", "Tüm Senaryoları Karşılaştır"),
                    AgentAction("green_credit", "Yeşil Kredi Seçenekleri"),
                ],
                confidence_score=0.90,
            )

        if intent == "run_scenario":
            emissions = self.get_parameter(request, "emissions", 20000.0)
            scenarios = []

            for name, price in self.CARBON_PRICES.items():
                cost = emissions * price
                scenarios.append({"Scenario": name, "Price": price, "Cost": cost})

            return AgentResponse(
                success=True,
                message="Senaryo analizi tamamlandı.",
                data={"Scenarios": scenarios},
                confidence_score=0.85,
            )

        return AgentResponse(
            success=True,
            message="Merhaba! Ben Maliyet Tahmin Ajanıyım. CBAM maliyetlerinizi hesaplayabilirim.",
            suggested_actions=[
                AgentAction("calculate_cbam_cost", "CBAM Maliyeti Hesapla"),
                AgentAction("run_scenario", "Senaryo Analizi"),
            ],
            confidence_score=1.0,
        )
