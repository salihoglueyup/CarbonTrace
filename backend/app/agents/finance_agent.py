from app.agents.base import BaseAgent, AgentRequest, AgentResponse, AgentAction
from typing import List


class FinancialAdvisorAgent(BaseAgent):
    """Finansal Danışman Ajanı"""

    @property
    def name(self) -> str:
        return "FinancialAdvisorAgent"

    @property
    def description(self) -> str:
        return "Yeşil finansman önerileri sunar."

    @property
    def capabilities(self) -> List[str]:
        return ["Yeşil kredi önerisi", "ROI hesaplama"]

    async def process_internal(self, request: AgentRequest) -> AgentResponse:
        intent = request.intent.lower()

        if intent == "green_credit_recommendation":
            revenue = self.get_parameter(request, "revenue", 100000000.0)
            emissions = self.get_parameter(request, "emissions", 50000.0)
            cbam_exposure = self.get_parameter(request, "cbam_exposure", 2000000.0)

            recommendations = [
                {
                    "ProductName": "Yeşil Enerji Kredisi",
                    "RecommendedAmount": min(revenue * 0.15, 20000000),
                    "InterestRate": 1.49,
                    "Term": 84,
                    "Purpose": "Güneş enerjisi santrali veya yenilenebilir enerji yatırımı",
                    "Priority": 1,
                },
                {
                    "ProductName": "Enerji Verimliliği Kredisi",
                    "RecommendedAmount": min(revenue * 0.08, 10000000),
                    "InterestRate": 1.79,
                    "Term": 60,
                    "Purpose": "Üretim süreçlerinde enerji verimliliği",
                    "Priority": 2,
                },
                {
                    "ProductName": "Temiz Teknoloji Kredisi",
                    "RecommendedAmount": min(revenue * 0.12, 15000000),
                    "InterestRate": 1.99,
                    "Term": 72,
                    "Purpose": "Düşük karbonlu üretim teknolojilerine geçiş",
                    "Priority": 1,
                },
            ]

            return AgentResponse(
                success=True,
                message="Şirketiniz için 3 yeşil kredi ürünü öneriyoruz.",
                data={
                    "CompanyRevenue": revenue,
                    "CurrentEmissions": emissions,
                    "CBAMExposure": cbam_exposure,
                    "Recommendations": recommendations,
                },
                suggested_actions=[
                    AgentAction("apply_credit", "Kredi Başvurusu Yap"),
                    AgentAction("calculate_roi", "ROI Hesapla"),
                ],
                confidence_score=0.91,
            )

        if intent == "calculate_roi":
            investment = self.get_parameter(request, "investment", 1000000.0)
            annual_benefit = self.get_parameter(request, "annual_benefit", 200000.0)
            years = self.get_parameter(request, "years", 5)

            total_return = annual_benefit * years
            net_return = total_return - investment
            roi = (net_return / investment) * 100
            annual_roi = roi / years

            return AgentResponse(
                success=True,
                message=f"{years} yıllık ROI: %{roi:.1f} (Yıllık %{annual_roi:.1f})",
                data={
                    "Investment": investment,
                    "TotalReturn": total_return,
                    "NetReturn": net_return,
                    "ROI": round(roi, 1),
                    "AnnualROI": round(annual_roi, 1),
                },
                confidence_score=0.95,
            )

        return AgentResponse(
            success=True,
            message="Merhaba! Ben Finansal Danışman Ajanıyım. Yeşil kredi önerileri ve ROI hesaplaması yapabilirim.",
            suggested_actions=[
                AgentAction("green_credit_recommendation", "Yeşil Kredi Önerisi"),
                AgentAction("calculate_roi", "ROI Hesapla"),
            ],
            confidence_score=1.0,
        )
