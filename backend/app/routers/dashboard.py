from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.player import Player
from app.models.team import Team
from app.models.versus_match import VersusMatch
from app.routers.rankings import get_player_rankings, get_team_rankings

router = APIRouter(prefix="/api/v1/admin/dashboard", tags=["dashboard"])


@router.get("")
async def dashboard(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    player_count = (await db.execute(select(func.count(Player.id)))).scalar_one()
    team_count = (await db.execute(select(func.count(Team.id)))).scalar_one()
    result_count = (await db.execute(select(func.count(VersusMatch.id)))).scalar_one()
    top_players, _ = await get_player_rankings(db, 1, 3)
    top_teams, _ = await get_team_rankings(db, 1, 3)
    return {
        "data": {
            "player_count": player_count,
            "team_count": team_count,
            "result_count": result_count,
            "top_players": top_players,
            "top_teams": top_teams,
        }
    }
