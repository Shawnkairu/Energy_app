# backend/services/store.py
import json
from pathlib import Path
from typing import List, Dict, Any

DATA_PATH = Path(__file__).resolve().parents[1] / "data"
DATA_PATH.mkdir(parents=True, exist_ok=True)
USERS_FILE = DATA_PATH / "users.json"

DEFAULT_USERS = [
    {"name": "Amina",  "profile": "basic_lighting",    "alpha": 0.5},
    {"name": "Otieno", "profile": "lighting_tv",        "alpha": 0.6},
    {"name": "Wanjiku","profile": "emerging_appliance", "alpha": 0.4},
    {"name": "Juma",   "profile": "microbiz_kiosk",     "alpha": 0.5},
]

def _read_users() -> List[Dict[str, Any]]:
    if not USERS_FILE.exists():
        USERS_FILE.write_text(json.dumps(DEFAULT_USERS, indent=2))
    return json.loads(USERS_FILE.read_text())

def _write_users(users: List[Dict[str, Any]]) -> None:
    USERS_FILE.write_text(json.dumps(users, indent=2))

def list_users() -> List[Dict[str, Any]]:
    return _read_users()

def update_user_alpha(name: str, alpha: float) -> Dict[str, Any]:
    users = _read_users()
    found = False
    for u in users:
        if u["name"] == name:
            u["alpha"] = max(0.0, min(1.0, float(alpha)))
            found = True
            break
    if not found:
        raise KeyError(f"user '{name}' not found")
    _write_users(users)
    return next(u for u in users if u["name"] == name)