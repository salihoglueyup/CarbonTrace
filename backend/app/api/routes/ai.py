import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.models.user import User
from app.core.security import get_current_user
from app.core.rag import rag_service
from app.core.llm_providers import LLMProvider

router = APIRouter()


class AskRequest(BaseModel):
    pquestion: str
    provider: LLMProvider = LLMProvider.OPENAI
    use_rag: bool = True


class AskResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = None


@router.post("/ask", response_model=AskResponse)
async def ask_ai(request: AskRequest, current_user: User = Depends(get_current_user)):
    """
    Ask a question to the AI assistant.
    If use_rag is True, it searches the vector store for context.
    """
    try:
        if request.use_rag:
            answer = await rag_service.ask(request.pquestion, request.provider)
            # Todo: Extract sources from RAG response if possible
            return AskResponse(answer=answer, sources=[])
        else:
            # Direct LLM call (Chat mode)
            # We need to implement a direct chat method in RAG service or LLM provider
            # For now, let's use the RAG service ask just without context if possible,
            # Or better, let's import generate_ai_response from llm_providers
            from app.core.llm_providers import generate_ai_response

            answer = await generate_ai_response(request.pquestion, request.provider)
            return AskResponse(answer=answer)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload", status_code=201)
async def upload_document(
    file: UploadFile = File(...), current_user: User = Depends(get_current_user)
):
    """
    Upload a PDF document to the knowledge base (Admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can upload documents")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_location = f"app/data/regulations/{file.filename}"

    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_location), exist_ok=True)

        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)

        # Trigger ingestion
        num_chunks = await rag_service.ingest_document(file_location)

        return {
            "message": f"Successfully uploaded {file.filename} and created {num_chunks} chunks."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
