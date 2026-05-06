from fastapi import APIRouter, HTTPException
from app.schemas.auth import AuthUser, RequestOtpInput, TokenResponse, VerifyOtpInput
from app.services.auth import create_token
from app.store import store

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/request-otp")
def request_otp(payload: RequestOtpInput):
    code = store.issue_otp(payload.phone)
    print(f"e.mappa pilot OTP for {payload.phone}: {code}")
    return {"status": "sent", "channel": "console"}


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(payload: VerifyOtpInput):
    user = store.verify_otp(payload.phone, payload.code)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")
    return {"token": create_token(user), "user": user}


@router.get("/me", response_model=AuthUser)
def me():
    return store.default_user()
