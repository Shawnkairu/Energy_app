from pydantic import BaseModel, Field


class WaitlistLead(BaseModel):
    role: str = Field(min_length=2)
    phone: str = Field(min_length=7)
    neighborhood: str = Field(min_length=2)


class WaitlistSubmission(WaitlistLead):
    id: str
    createdAt: str
    source: str
