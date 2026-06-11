from datetime import datetime

from pydantic import BaseModel, Field


class TeamBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    note: str | None = None
    status: str = "active"


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    note: str | None = None
    status: str | None = None


class TeamOut(TeamBase):
    id: int
    member_count: int = 0
    created_at: datetime | None = None


class TeamMemberInput(BaseModel):
    player_id: int
    role: str | None = "member"
    is_active: bool = True


class SaveTeamMembersRequest(BaseModel):
    members: list[TeamMemberInput]


class TeamMemberOut(BaseModel):
    id: int
    player_id: int
    player_name: str
    role: str | None = None
    is_active: bool
