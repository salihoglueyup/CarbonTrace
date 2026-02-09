from typing import Dict, Optional
from app.agents.base import BaseAgent, AgentRequest, AgentResponse, AgentAction
from app.agents.emission_agent import EmissionAnalysisAgent
from app.agents.cost_agent import CostPredictionAgent
from app.agents.finance_agent import FinancialAdvisorAgent
from app.core.llm_providers import (
    LLMProvider,
    LLMProviderFactory,
    generate_ai_response,
    CBAM_SYSTEM_PROMPT,
)
from app.services.rag_service import get_rag_context
import re


class AgentOrchestrator:
    """Ajan Orkestratörü - LLM ve RAG destekli akıllı yönlendirme"""

    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self._register_default_agents()
        self.use_llm = True  # LLM kullanımını etkinleştir

        # Intent mapping - anahtar kelimeler ve hangi ajana gideceği
        self.intent_mapping = [
            (
                [
                    "emisyon",
                    "emission",
                    "karbon",
                    "carbon",
                    "ayak izi",
                    "footprint",
                    "scope",
                ],
                "EmissionAnalysisAgent",
                "analyze_emissions",
            ),
            (
                ["maliyet", "cost", "cbam", "fiyat", "price", "senaryo", "scenario"],
                "CostPredictionAgent",
                "calculate_cbam_cost",
            ),
            (
                ["kredi", "credit", "finans", "yatırım", "investment", "roi", "yeşil"],
                "FinancialAdvisorAgent",
                "green_credit_recommendation",
            ),
        ]

    def _register_default_agents(self):
        """Varsayılan ajanları kaydet"""
        self.register_agent(EmissionAnalysisAgent())
        self.register_agent(CostPredictionAgent())
        self.register_agent(FinancialAdvisorAgent())

    def register_agent(self, agent: BaseAgent):
        """Ajan kaydet"""
        self.agents[agent.name] = agent

    def _determine_agent(self, message: str) -> tuple:
        """Mesajdan doğru ajanı ve intent'i belirle"""
        lower_message = message.lower()

        for keywords, agent_name, intent in self.intent_mapping:
            if any(keyword in lower_message for keyword in keywords):
                return agent_name, intent

        return "", ""

    def _extract_parameters(self, message: str) -> Dict:
        """Mesajdan parametreleri çıkar"""
        params = {}

        # Sayıları bul
        numbers = re.findall(r"\d+(?:[.,]\d+)?", message)
        if numbers:
            for i, num in enumerate(numbers[:3]):
                params[f"number{i+1}"] = float(num.replace(",", "."))

        # Senaryo belirleme
        if "kötümser" in message.lower() or "aggressive" in message.lower():
            params["scenario"] = "Aggressive"
        elif "iyimser" in message.lower() or "conservative" in message.lower():
            params["scenario"] = "Conservative"
        else:
            params["scenario"] = "Moderate"

        return params

    async def process_message(
        self,
        message: str,
        company_id: Optional[int] = None,
        provider: Optional[str] = None,
        use_rag: bool = True,
    ) -> AgentResponse:
        """Kullanıcı mesajını işle - LLM ve RAG destekli"""

        # LLM provider seçimi
        llm_provider = None
        if provider:
            try:
                llm_provider = LLMProvider(provider)
            except ValueError:
                pass

        # Önce agent-based yaklaşımı dene
        agent_name, intent = self._determine_agent(message)

        if agent_name:
            # Spesifik bir agent bulundu, onu kullan
            agent = self.agents.get(agent_name)
            if agent:
                request = AgentRequest(
                    intent=intent,
                    parameters=self._extract_parameters(message),
                    company_id=company_id,
                    message=message,
                )
                return await agent.process(request)

        # Agent bulunamadı, LLM kullan
        return await self._process_with_llm(message, llm_provider, use_rag)

    async def _process_with_llm(
        self, message: str, provider: Optional[LLMProvider] = None, use_rag: bool = True
    ) -> AgentResponse:
        """LLM ile mesajı işle"""

        # RAG context al
        rag_context = ""
        if use_rag:
            try:
                rag_context = await get_rag_context(message)
            except Exception as e:
                print(f"RAG error: {e}")

        # LLM kullanılabilir mi kontrol et
        try:
            available_providers = LLMProviderFactory.get_available_providers()

            if not available_providers:
                # LLM yok, fallback yanıt
                return self._get_welcome_response()

            # Prompt oluştur
            prompt = message
            if rag_context:
                prompt = f"""Kullanıcı Sorusu: {message}

İlgili Bilgi Tabanı:
{rag_context}

Yukarıdaki bilgi tabanını kullanarak ve CBAM uzmanı olarak yanıt ver."""

            # LLM'den yanıt al
            response_text = await generate_ai_response(
                prompt=prompt, provider=provider, use_cbam_context=True
            )

            # Provider bilgisini ekle
            used_provider = (
                provider if provider else LLMProviderFactory.get_default_provider()
            )
            provider_name = used_provider.__class__.__name__.replace("Provider", "")

            return AgentResponse(
                success=True,
                message=response_text,
                data={
                    "provider": provider_name,
                    "used_rag": bool(rag_context),
                    "rag_sources": ["CBAM Knowledge Base"] if rag_context else [],
                },
                suggested_actions=[
                    AgentAction("analyze_emissions", "🌿 Emisyon Analizi"),
                    AgentAction("calculate_cbam_cost", "💰 CBAM Hesapla"),
                    AgentAction("green_credit_recommendation", "🏦 Yeşil Kredi"),
                ],
                confidence_score=0.9,
            )

        except Exception as e:
            print(f"LLM Error: {e}")
            return self._get_fallback_response(str(e))

    def _get_fallback_response(self, error: str = "") -> AgentResponse:
        """LLM olmadığında veya hata durumunda fallback yanıt"""
        msg = """Şu anda AI servisine bağlanamıyorum. 

Lütfen aşağıdaki seçeneklerden birini deneyin veya daha sonra tekrar deneyin.

**İpucu:** AI özelliklerini kullanmak için .env dosyasına API anahtarlarınızı ekleyin:
- OPENAI_API_KEY
- GOOGLE_API_KEY  
- ANTHROPIC_API_KEY"""

        if error:
            msg += f"\n\n_Hata: {error}_"

        return AgentResponse(
            success=False,
            message=msg,
            suggested_actions=[
                AgentAction("analyze_emissions", "🌿 Emisyon Analizi"),
                AgentAction("calculate_cbam_cost", "💰 CBAM Hesapla"),
                AgentAction("green_credit_recommendation", "🏦 Yeşil Kredi"),
            ],
            confidence_score=0.5,
        )

    def _get_welcome_response(self) -> AgentResponse:
        """Karşılama yanıtı"""
        return AgentResponse(
            success=True,
            message="""Merhaba! Ben CBAM Guard AI Asistanınızım. 👋

Size şu konularda yardımcı olabilirim:

🌿 **Emisyon Analizi** - Karbon ayak izi hesaplama
💰 **Maliyet Tahmini** - CBAM maliyet projeksiyonu
🏦 **Yeşil Finansman** - Kredi önerileri ve ROI

Nasıl yardımcı olabilirim?""",
            suggested_actions=[
                AgentAction("analyze_emissions", "🌿 Emisyon Analizi Yap"),
                AgentAction("calculate_cbam_cost", "💰 CBAM Maliyeti Hesapla"),
                AgentAction("green_credit_recommendation", "🏦 Yeşil Kredi Önerisi"),
            ],
            confidence_score=1.0,
        )


# Singleton instance
orchestrator = AgentOrchestrator()
