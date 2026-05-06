from fastapi import APIRouter, HTTPException
from app.schemas.drs import DrsUpdateInput
from app.services.projector import project_building
from app.store import store

router = APIRouter(prefix="/drs", tags=["drs"])


@router.get("/{building_id}")
def get_drs(building_id: str):
    project = store.get_project(building_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Building not found")
    return project_building(project)["drs"]


@router.get("/{building_id}/history")
def drs_history(building_id: str):
    if store.get_project(building_id) is None:
        raise HTTPException(status_code=404, detail="Building not found")
    return store.drs_history(building_id)


@router.post("/{building_id}/update")
def update_drs(building_id: str, payload: DrsUpdateInput):
    project = store.update_drs(building_id, payload.model_dump(exclude_none=True))
    if project is None:
        raise HTTPException(status_code=404, detail="Building not found")
    return project_building(project)["drs"]


@router.post("/{building_id}/assess")
def assess_drs(building_id: str):
    project = store.get_project(building_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Building not found")
    drs = project_building(project)["drs"]
    recommendations = drs["reasons"] or ["Keep prepaid balances funded before allocation.", "Keep supplier, installer, and monitoring proof current."]
    return {"score": drs["score"], "decision": drs["decision"], "analysis": f"{project['name']} is {drs['label'].lower()} with {len(drs['reasons'])} active blockers.", "recommendations": recommendations[:4], "toolCallsMade": ["get_building_data", "calculate_drs"]}
