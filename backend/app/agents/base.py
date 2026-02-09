from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
import asyncio


@dataclass
class AgentRequest:
    intent: str
    parameters: Dict[str, Any]
    company_id: Optional[int] = None
    message: Optional[str] = None


@dataclass
class AgentAction:
    action_type: str
    label: str


@dataclass
class AgentResponse:
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    suggested_actions: Optional[List[AgentAction]] = None
    confidence_score: float = 1.0


class BaseAgent(ABC):
    """Tüm ajanlar için temel sınıf"""

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        pass

    @property
    @abstractmethod
    def capabilities(self) -> List[str]:
        pass

    async def process(self, request: AgentRequest) -> AgentResponse:
        """Ana işleme metodu"""
        try:
            return await self.process_internal(request)
        except Exception as e:
            return AgentResponse(success=False, message=f"Hata: {str(e)}")

    @abstractmethod
    async def process_internal(self, request: AgentRequest) -> AgentResponse:
        pass

    def get_parameter(
        self, request: AgentRequest, key: str, default: Any = None
    ) -> Any:
        """Parametreyi güvenli şekilde al"""
        return request.parameters.get(key, default)
