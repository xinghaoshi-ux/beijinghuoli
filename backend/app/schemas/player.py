from datetime import datetime

from pydantic import BaseModel, Field


class PlayerBase(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    team_id: int | None = None
    phone: str | None = None
    note: str | None = None
    status: str = "active"


class PlayerCreate(PlayerBase):
    pass


class PlayerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    team_id: int | None = None
    phone: str | None = None
    note: str | None = None
    status: str | None = None


class PlayerOut(PlayerBase):
    id: int
    team_name: str | None = None
    created_at: datetime | None = None
