from pydantic import BaseModel, Field


class OwnershipTransferInput(BaseModel):
    pool: str
    fromOwnerId: str
    toOwnerId: str
    toOwnerRole: str
    percentage: float = Field(gt=0)
