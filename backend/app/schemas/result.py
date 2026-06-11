from datetime import date, datetime

from pydantic import BaseModel, Field


class ResultPlayerOut(BaseModel):
    id: int
    name: str
    team_name: str | None = None


class ResultTeamOut(BaseModel):
    id: int
    name: str


class MatchResultOut(BaseModel):
    id: int
    item_id: int
    item_name: str
    result_scope: str
    rank_label: str | None = None
    rank_order: int | None = None
    players: list[ResultPlayerOut] = []
    team: ResultTeamOut | None = None
    score_text: str | None = None
    points: int
    note: str | None = None
    source_type: str | None = None
    upload_batch_id: int | None = None
    created_at: datetime | None = None


class MatchResultCreate(BaseModel):
    item_id: int
    result_scope: str
    rank_label: str | None = None
    rank_order: int | None = None
    player_ids: list[int] = []
    team_id: int | None = None
    score_text: str | None = None
    points: int = Field(ge=0)
    note: str | None = None


class MatchResultUpdate(MatchResultCreate):
    pass


class VersusMatchSidePlayerOut(BaseModel):
    id: int
    name: str
    team_id: int
    team_name: str


class VersusMatchOut(BaseModel):
    id: int
    match_date: date | None = None
    sequence_no: int | None = None
    court: str | None = None
    group_name: str | None = None
    age_group: str | None = None
    item_id: int
    item_name: str
    team_a_id: int
    team_a_name: str
    team_b_id: int
    team_b_name: str
    team_a_players: list[VersusMatchSidePlayerOut] = []
    team_b_players: list[VersusMatchSidePlayerOut] = []
    team_a_score: int
    team_b_score: int
    score_text: str
    winner_team_id: int
    winner_team_name: str
    note: str | None = None
    source_type: str | None = None
    upload_batch_id: int | None = None
    created_at: datetime | None = None


class VersusMatchCreate(BaseModel):
    match_date: date | None = None
    sequence_no: int | None = Field(default=None, ge=1)
    court: str | None = None
    group_name: str | None = None
    age_group: str | None = None
    item_id: int
    team_a_id: int
    team_b_id: int
    team_a_player_ids: list[int]
    team_b_player_ids: list[int]
    team_a_score: int = Field(ge=0)
    team_b_score: int = Field(ge=0)
    note: str | None = None


class VersusMatchUpdate(VersusMatchCreate):
    pass
