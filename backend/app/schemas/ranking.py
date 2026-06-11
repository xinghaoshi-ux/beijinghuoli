from pydantic import BaseModel


class PlayerRankingOut(BaseModel):
    rank: int
    ranking: int
    player_id: int
    player_name: str
    team_id: int | None = None
    team_name: str | None = None
    appearance_count: int
    set_win_count: int
    set_loss_count: int
    games_for: int
    games_against: int
    net_games: int
    win_count: int
    total_score: int
    total_points: int
    result_count: int


class TeamRankingOut(BaseModel):
    rank: int
    ranking: int
    team_id: int
    team_name: str
    duel_win_count: int
    duel_loss_count: int
    set_win_count: int
    set_loss_count: int
    games_for: int
    games_against: int
    net_games: int
    match_win_count: int
    match_loss_count: int
    total_score: int
    opponent_results: list[str]
    total_points: int
    result_count: int
