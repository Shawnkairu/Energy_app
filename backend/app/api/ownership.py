from fastapi import APIRouter, HTTPException
from app.schemas.ownership import OwnershipTransferInput
from app.store import store

router = APIRouter(prefix="/ownership", tags=["ownership"])


@router.get("/{building_id}/{pool}")
def get_ownership(building_id: str, pool: str):
    project = store.get_project(building_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Building not found")
    if pool not in {"provider", "financier"}:
        raise HTTPException(status_code=400, detail="Pool must be provider or financier")
    return project[f"{pool}Ownership"]


@router.post("/{building_id}/transfer")
def transfer(building_id: str, payload: OwnershipTransferInput):
    try:
        return store.transfer_ownership(building_id, payload.model_dump())
    except KeyError:
        raise HTTPException(status_code=404, detail="Building not found")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
