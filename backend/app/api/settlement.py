from fastapi import APIRouter, HTTPException
from app.schemas.settlement import SettlementRunInput
from app.services.settlement_runner import run_settlement
from app.store import store

router = APIRouter(prefix="/settlement", tags=["settlement"])


@router.post("/run")
def run(payload: SettlementRunInput):
    try:
        return run_settlement(store, payload.buildingId, payload.periodStart, payload.periodEnd)
    except KeyError:
        raise HTTPException(status_code=404, detail="Building not found")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/{building_id}/history")
def history(building_id: str):
    if store.get_project(building_id) is None:
        raise HTTPException(status_code=404, detail="Building not found")
    return store.settlement_history(building_id)


@router.get("/{building_id}/latest")
def latest(building_id: str):
    records = store.settlement_history(building_id)
    return records[0] if records else None


@router.get("/{building_id}/waterfall")
def waterfall(building_id: str):
    project = store.get_project(building_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Building not found")
    return {"buildingId": building_id, "rates": project["settlementRates"]}
