from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.ProjectResponse])
def read_projects(
    company_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.Project)
    if company_id:
        query = query.filter(models.Project.company_id == company_id)
    return query.offset(skip).limit(limit).all()


@router.post("/", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def read_project(project_id: int, db: Session = Depends(get_db)):
    db_project = (
        db.query(models.Project).filter(models.Project.id == project_id).first()
    )
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project


@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(
    project_id: int, project: schemas.ProjectUpdate, db: Session = Depends(get_db)
):
    db_project = (
        db.query(models.Project).filter(models.Project.id == project_id).first()
    )
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)

    db.commit()
    db.refresh(db_project)
    return db_project


@router.delete("/{project_id}", response_model=schemas.ProjectResponse)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = (
        db.query(models.Project).filter(models.Project.id == project_id).first()
    )
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(db_project)
    db.commit()
    return db_project
