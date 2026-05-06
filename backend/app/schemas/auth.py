from pydantic import BaseModel, Field


class RequestOtpInput(BaseModel):
    phone: str = Field(min_length=7)


class VerifyOtpInput(RequestOtpInput):
    code: str = Field(min_length=6, max_length=6)


class AuthUser(BaseModel):
    id: str
    phone: str
    role: str
    buildingId: str | None = None


class TokenResponse(BaseModel):
    token: str
    user: AuthUser
