from fastapi import APIRouter, HTTPException
from app.schemas.prepaid import PrepaidCommitInput, PrepaidCommitment
from app.store import store

router = APIRouter(prefix="/prepaid", tags=["prepaid"])


@router.post("/commit", response_model=PrepaidCommitment)
def commit_prepaid(payload: PrepaidCommitInput):
    if store.get_project(payload.buildingId) is None:
        raise HTTPException(status_code=404, detail="Building not found")
    return store.create_prepaid_commitment(payload.buildingId, payload.amountKes, payload.residentId)


@router.post("/{commitment_id}/confirm", response_model=PrepaidCommitment)
def confirm_prepaid(commitment_id: str):
    commitment = store.confirm_prepaid_commitment(commitment_id)
    if commitment is None:
        raise HTTPException(status_code=404, detail="Commitment not found")
    return commitment


@router.get("/{building_id}/balance")
def prepaid_balance(building_id: str):
    if store.get_project(building_id) is None:
        raise HTTPException(status_code=404, detail="Building not found")
    return {"buildingId": building_id, "confirmedKes": store.prepaid_balance(building_id)}


@router.get("/{building_id}/history", response_model=list[PrepaidCommitment])
def prepaid_history(building_id: str):
    if store.get_project(building_id) is None:
        raise HTTPException(status_code=404, detail="Building not found")
    return store.prepaid_history(building_id)
