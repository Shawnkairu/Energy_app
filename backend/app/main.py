from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, drs, health, ownership, prepaid, projects, roles, settlement, waitlist, websocket
from .config import get_settings

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in [health.router, auth.router, roles.router, projects.router, waitlist.router, prepaid.router, drs.router, settlement.router, ownership.router, websocket.router]:
    app.include_router(router)
