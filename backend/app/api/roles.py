from fastapi import APIRouter, HTTPException
from app.data.demo import ROLES
from app.store import store
from app.services.projector import project_building
from app.schemas.role import RoleHome

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("")
def list_roles():
    return ROLES


@router.get("/{role}/home", response_model=RoleHome)
def role_home(role: str):
    if role not in {item["id"] for item in ROLES}:
        raise HTTPException(status_code=404, detail="Unknown role")
    projects = [project_building(project) for project in store.list_projects()]
    if not projects:
        raise HTTPException(status_code=404, detail="No projects available")
    return {"role": role, "primary": projects[0], "projects": projects, "activity": store.activity_feed()}
