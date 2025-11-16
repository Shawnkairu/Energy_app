# limablu_mobile/backend/app.py
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import pandas as pd
import time

from backend.services.store import list_users, update_user_alpha

# Import your services (absolute imports from the backend package)
from backend.services.profiles import make_users
from backend.services.optimization import allocate_per_user_day_per_alpha
from backend.services.billing import (
    simulate_postpaid_cost,
    simulate_token_cost,
    simulate_subscription_cost,
)

app = FastAPI(title="LimaBlu API")

# --- CORS (dev) ---
app.add_middleware(
    CORSMiddleware,
    # Easiest for local dev—allow localhost/127.* on any port
    allow_origin_regex=r"^https?://(127\.0\.0\.1|localhost)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],   # includes OPTIONS
    allow_headers=["*"],
)

# Optional safety-net to force 200 for any OPTIONS
@app.options("/{rest_of_path:path}")
def preflight(rest_of_path: str):
    return Response(status_code=200)

@app.get("/ping")
def ping():
    return {"status": "ok", "message": "Backend is live"}


# ---- Models ----
class Provider(BaseModel):
    provider: str
    price_per_kwh: float
    capacity_kwh: float

class UserConfig(BaseModel):
    name: str
    profile: str

class OptimizeRequest(BaseModel):
    providers: List[Provider]
    users: List[UserConfig]
    days: int
    user_prefs: Dict[str, float]  # { "Amina": 0.5, ... }

class BillingRequest(BaseModel):
    alloc: List[Dict]   # rows: {user, day, provider, alloc_kwh}
    providers: List[Provider]
    model: str          # "postpaid"|"token"|"subscription"
    token_kwh: float | None = None
    allowance_kwh: float | None = None
    rollover: bool = True

class UserOut(BaseModel):
    name: str
    profile: str
    alpha: float

class PrefsIn(BaseModel):
    price_priority: float  # 0..1


# POST /payments/buy_power
class BuyPowerBody(BaseModel):
    amount_ksh: float

@app.post("/payments/buy_power")
def buy_power(body: BuyPowerBody):
    # TODO: integrate M-Pesa; for now, return simulated token conversion
    tokens_kwh = body.amount_ksh / 50.0  # placeholder rate
    return {
        "status": "ok",
        "amount_ksh": body.amount_ksh,
        "tokens_kwh": tokens_kwh,
        "reference": f"LB-{int(time.time()*1000)}"
    }

# ---- Endpoints ----
@app.get("/users", response_model=List[UserOut])
def get_users():
    return list_users()

@app.patch("/users/{name}/prefs", response_model=UserOut)
def patch_user_prefs(name: str, body: PrefsIn):
    try:
        return update_user_alpha(name, body.price_priority)
    except KeyError:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")

@app.post("/optimize")
@app.post("/optimize")
def optimize(req: OptimizeRequest):
    prov_df = pd.DataFrame([p.model_dump() for p in req.providers])
    users_payload = [u.model_dump() for u in req.users] if req.users else list_users()
    # build prefs: request overrides store; otherwise derive from store
    prefs = req.user_prefs or {u["name"]: u.get("alpha", 0.5) for u in users_payload}

    usage_df = make_users(users_payload, req.days, seed=42)
    alloc_df = allocate_per_user_day_per_alpha(prov_df, usage_df, prefs)
    return {
        "usage": usage_df.to_dict(orient="records"),
        "allocation": alloc_df.to_dict(orient="records"),
    }

@app.post("/bill")
def bill(req: BillingRequest):
    prov_df = pd.DataFrame([p.model_dump() for p in req.providers])
    alloc_df = pd.DataFrame(req.alloc)
    model = req.model.lower()
    if model == "postpaid":
        df = simulate_postpaid_cost(alloc_df, prov_df)
        return {"bill": df.to_dict(orient="records"), "total_cost": float(df["cost"].sum())}
    elif model == "token":
        df = simulate_token_cost(alloc_df, prov_df, req.token_kwh or 0.0)
        return {"bill": df.to_dict(orient="records"), "total_cost": float(df["cost"].sum())}
    else:
        df, roll = simulate_subscription_cost(alloc_df, prov_df, req.allowance_kwh or 0.0, req.rollover)
        return {"bill": df.to_dict(orient="records"), "total_cost": float(df["cost"].sum()), "rollover": roll}