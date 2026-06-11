from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.exceptions import ConflictError, NotFoundError, ValidationAppError
from app.models.player import Player
from app.models.team import Team
from app.schemas.player import PlayerCreate, PlayerUpdate

router = APIRouter(prefix="/api/v1/admin/players", tags=["players"])


def _player_data(player: Player, team_name: str | None = None) -> dict:
    return {
        "id": player.id,
        "name": player.name,
        "team_id": player.team_id,
        "team_name": team_name,
        "phone": player.phone,
        "note": player.note,
        "status": player.status,
        "created_at": player.created_at.isoformat() if player.created_at else None,
    }


@router.get("")
async def list_players(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    query = select(Player, Team.name.label("team_name")).outerjoin(Team, Team.id == Player.team_id)
    count_query = select(func.count(Player.id))
    if search:
        query = query.where(Player.name.ilike(f"%{search}%"))
        count_query = count_query.where(Player.name.ilike(f"%{search}%"))
    total = (await db.execute(count_query)).scalar_one()
    rows = (
        await db.execute(
            query.order_by(Player.id.desc()).offset((page - 1) * page_size).limit(page_size)
        )
    ).all()
    return {
        "data": [_player_data(row[0], row.team_name) for row in rows],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("", status_code=201)
async def create_player(
    body: PlayerCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    if body.status not in ("active", "inactive"):
        raise ValidationAppError("球员状态无效", "PLAYER_STATUS_INVALID")
    player = Player(**body.model_dump())
    db.add(player)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise ConflictError("球员姓名重复", "PLAYER_NAME_DUPLICATED") from exc
    await db.refresh(player)
    return {"data": _player_data(player), "message": "ok"}


@router.put("/{player_id}")
async def update_player(
    player_id: int,
    body: PlayerUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    player = (await db.execute(select(Player).where(Player.id == player_id))).scalar_one_or_none()
    if not player:
        raise NotFoundError("球员不存在", "PLAYER_NOT_FOUND")
    data = body.model_dump(exclude_unset=True)
    if "status" in data and data["status"] not in ("active", "inactive"):
        raise ValidationAppError("球员状态无效", "PLAYER_STATUS_INVALID")
    for key, value in data.items():
        setattr(player, key, value)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise ConflictError("球员姓名重复", "PLAYER_NAME_DUPLICATED") from exc
    await db.refresh(player)
    return {"data": _player_data(player), "message": "ok"}
