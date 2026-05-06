from fastapi import APIRouter, HTTPException
from app.store import store
from app.services.projector import project_building

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("")
def list_projects():
    return [project_building(project) for project in store.list_projects()]


@router.get("/{project_id}")
def get_project(project_id: str):
    project = store.get_project(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project_building(project)
