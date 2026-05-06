from pydantic import BaseModel, Field


class PrepaidCommitInput(BaseModel):
    buildingId: str
    amountKes: float = Field(gt=0)
    residentId: str = "pilot-resident"


class PrepaidCommitment(BaseModel):
    id: str
    buildingId: str
    residentId: str
    amountKes: float
    status: str
    createdAt: str
