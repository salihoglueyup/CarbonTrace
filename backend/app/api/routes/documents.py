"""
Document Upload API Routes
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
import os

from app.services.document_service import document_service

router = APIRouter()

# In-memory document storage (in production, use database)
documents_db = []


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and analyze a document"""

    # Validate file
    content = await file.read()
    is_valid, error = document_service.validate_file(file.filename, len(content))

    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    # Save file
    filepath = await document_service.save_file(file.filename, content)

    # Analyze document
    analysis = await document_service.analyze_document(filepath)

    # Store document info
    doc_record = {
        "id": len(documents_db) + 1,
        "filename": file.filename,
        "filepath": filepath,
        "size": len(content),
        "uploaded_at": datetime.now().isoformat(),
        "analysis": analysis,
        "status": "analyzed" if analysis.get("success") else "error",
    }
    documents_db.append(doc_record)

    return {
        "success": True,
        "document": {
            "id": doc_record["id"],
            "filename": doc_record["filename"],
            "size": doc_record["size"],
            "uploaded_at": doc_record["uploaded_at"],
            "status": doc_record["status"],
        },
        "analysis": analysis,
    }


@router.get("/")
async def get_documents():
    """Get list of uploaded documents"""
    return {
        "success": True,
        "documents": [
            {
                "id": doc["id"],
                "filename": doc["filename"],
                "size": doc["size"],
                "uploaded_at": doc["uploaded_at"],
                "status": doc["status"],
            }
            for doc in documents_db
        ],
    }


@router.get("/{document_id}")
async def get_document(document_id: int):
    """Get document details and analysis"""
    for doc in documents_db:
        if doc["id"] == document_id:
            return {"success": True, "document": doc}

    raise HTTPException(status_code=404, detail="Document not found")


@router.delete("/{document_id}")
async def delete_document(document_id: int):
    """Delete a document"""
    global documents_db

    for i, doc in enumerate(documents_db):
        if doc["id"] == document_id:
            # Delete file
            try:
                os.remove(doc["filepath"])
            except:
                pass

            documents_db.pop(i)
            return {"success": True, "message": "Document deleted"}

    raise HTTPException(status_code=404, detail="Document not found")


@router.post("/{document_id}/reanalyze")
async def reanalyze_document(document_id: int):
    """Re-analyze a document"""
    for doc in documents_db:
        if doc["id"] == document_id:
            analysis = await document_service.analyze_document(doc["filepath"])
            doc["analysis"] = analysis
            doc["status"] = "analyzed" if analysis.get("success") else "error"

            return {"success": True, "analysis": analysis}

    raise HTTPException(status_code=404, detail="Document not found")
