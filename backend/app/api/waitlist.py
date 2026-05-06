from fastapi import APIRouter
from app.schemas.waitlist import WaitlistLead, WaitlistSubmission
from app.store import store

router = APIRouter(prefix="/waitlist", tags=["waitlist"])


@router.post("", response_model=WaitlistSubmission)
def submit_waitlist(lead: WaitlistLead):
    return store.add_waitlist_lead(lead.model_dump())
