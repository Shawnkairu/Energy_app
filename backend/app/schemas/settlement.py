from datetime import date
from pydantic import BaseModel


class SettlementRunInput(BaseModel):
    buildingId: str
    periodStart: date
    periodEnd: date
