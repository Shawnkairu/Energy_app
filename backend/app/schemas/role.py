from typing import Any
from pydantic import BaseModel


class RoleHome(BaseModel):
    role: str
    primary: dict[str, Any]
    projects: list[dict[str, Any]]
    activity: list[str]
