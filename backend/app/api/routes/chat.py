from fastapi import APIRouter, Query
from typing import Optional
from pydantic import BaseModel
from app.schemas.schemas import ChatMessage, ChatResponse, SuggestedAction
from app.agents.orchestrator import orchestrator
from app.core.llm_providers import LLMProviderFactory, LLMProvider

router = APIRouter()


class ExtendedChatMessage(BaseModel):
    """Extended chat message with provider selection"""

    message: str
    company_id: Optional[int] = None
    provider: Optional[str] = None  # openai, gemini, claude
    use_rag: bool = True


@router.post("/", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """AI Chat endpoint - basic"""
    response = await orchestrator.process_message(
        message=message.message, company_id=message.company_id
    )

    suggested_actions = []
    if response.suggested_actions:
        for action in response.suggested_actions:
            suggested_actions.append(
                SuggestedAction(action_type=action.action_type, label=action.label)
            )

    return ChatResponse(
        success=response.success,
        message=response.message,
        data=response.data,
        suggested_actions=suggested_actions,
        confidence_score=response.confidence_score,
    )


@router.post("/v2", response_model=ChatResponse)
async def chat_v2(message: ExtendedChatMessage):
    """AI Chat endpoint v2 - with provider selection and RAG"""
    response = await orchestrator.process_message(
        message=message.message,
        company_id=message.company_id,
        provider=message.provider,
        use_rag=message.use_rag,
    )

    suggested_actions = []
    if response.suggested_actions:
        for action in response.suggested_actions:
            suggested_actions.append(
                SuggestedAction(action_type=action.action_type, label=action.label)
            )

    return ChatResponse(
        success=response.success,
        message=response.message,
        data=response.data,
        suggested_actions=suggested_actions,
        confidence_score=response.confidence_score,
    )


@router.get("/providers")
async def get_available_providers():
    """Get list of available LLM providers"""
    try:
        available = LLMProviderFactory.get_available_providers()
        return {
            "success": True,
            "providers": [p.value for p in available],
            "default": available[0].value if available else None,
        }
    except Exception as e:
        return {"success": False, "providers": [], "default": None, "error": str(e)}
