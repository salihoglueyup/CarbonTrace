from app.agents.base import BaseAgent, AgentRequest, AgentResponse, AgentAction
from typing import List


class EmissionAnalysisAgent(BaseAgent):
    """Emisyon Analiz Ajanı"""

    @property
    def name(self) -> str:
        return "EmissionAnalysisAgent"

    @property
    def description(self) -> str:
        return "Şirketlerin karbon emisyonlarını analiz eder."

    @property
    def capabilities(self) -> List[str]:
        return ["Emisyon hesaplama", "Sektör karşılaştırma"]

    async def process_internal(self, request: AgentRequest) -> AgentResponse:
        intent = request.intent.lower()

        if intent == "analyze_emissions":
            return AgentResponse(
                success=True,
                message="Emisyon analizi tamamlandı. Toplam: 61,000 tCO2e",
                data={
                    "TotalEmissions": 61000.0,
                    "Scope1": 42000.0,
                    "Scope2": 11500.0,
                    "Scope3": 7500.0,
                    "YoYChange": -7.3,
                    "SectorAverage": 450.0,
                    "PerformanceVsSector": "Sektör ortalamasının %9.6 altında - İYİ",
                },
                suggested_actions=[
                    AgentAction("view_details", "Detaylı Rapor"),
                    AgentAction("run_scenario", "Senaryo Analizi"),
                ],
                confidence_score=0.92,
            )

        return AgentResponse(
            success=True,
            message="Merhaba! Ben Emisyon Analiz Ajanıyım. Karbon ayak izi hesaplama ve sektör karşılaştırması yapabilirim.",
            suggested_actions=[AgentAction("analyze_emissions", "Emisyon Analizi Yap")],
            confidence_score=1.0,
        )
