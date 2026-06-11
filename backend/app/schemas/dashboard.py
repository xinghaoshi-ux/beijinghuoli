from pydantic import BaseModel


class DashboardOut(BaseModel):
    player_count: int
    team_count: int
    result_count: int
    top_players: list
    top_teams: list
