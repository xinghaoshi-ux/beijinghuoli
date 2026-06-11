from fastapi import APIRouter, Depends, Query
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.exceptions import ConflictError, NotFoundError, ValidationAppError
from app.models.player import Player
from app.models.team import Team
from app.models.team_member import TeamMember
from app.schemas.team import SaveTeamMembersRequest, TeamCreate, TeamUpdate

router = APIRouter(prefix="/api/v1/admin/teams", tags=["teams"])


async def _team_member_count(db: AsyncSession, team_id: int) -> int:
    return (
        await db.execute(
            select(func.count(TeamMember.id)).where(
                TeamMember.team_id == team_id,
                TeamMember.is_active.is_(True),
            )
        )
    ).scalar_one()


async def _team_data(db: AsyncSession, team: Team) -> dict:
    return {
        "id": team.id,
        "name": team.name,
        "member_count": await _team_member_count(db, team.id),
        "note": team.note,
        "status": team.status,
        "created_at": team.created_at.isoformat() if team.created_at else None,
    }


@router.get("")
async def list_teams(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    query = select(Team)
    count_query = select(func.count(Team.id))
    if search:
        query = query.where(Team.name.ilike(f"%{search}%"))
        count_query = count_query.where(Team.name.ilike(f"%{search}%"))
    total = (await db.execute(count_query)).scalar_one()
    teams = (
        await db.execute(
            query.order_by(Team.id.desc()).offset((page - 1) * page_size).limit(page_size)
        )
    ).scalars().all()
    return {
        "data": [await _team_data(db, team) for team in teams],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("", status_code=201)
async def create_team(
    body: TeamCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    if body.status not in ("active", "inactive"):
        raise ValidationAppError("球队状态无效", "TEAM_STATUS_INVALID")
    team = Team(**body.model_dump())
    db.add(team)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise ConflictError("球队名称重复", "TEAM_NAME_DUPLICATED") from exc
    await db.refresh(team)
    return {"data": await _team_data(db, team), "message": "ok"}


@router.put("/{team_id}")
async def update_team(
    team_id: int,
    body: TeamUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    team = (await db.execute(select(Team).where(Team.id == team_id))).scalar_one_or_none()
    if not team:
        raise NotFoundError("球队不存在", "TEAM_NOT_FOUND")
    data = body.model_dump(exclude_unset=True)
    if "status" in data and data["status"] not in ("active", "inactive"):
        raise ValidationAppError("球队状态无效", "TEAM_STATUS_INVALID")
    for key, value in data.items():
        setattr(team, key, value)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise ConflictError("球队名称重复", "TEAM_NAME_DUPLICATED") from exc
    await db.refresh(team)
    return {"data": await _team_data(db, team), "message": "ok"}


@router.get("/{team_id}/members")
async def get_members(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    team = (await db.execute(select(Team.id).where(Team.id == team_id))).scalar_one_or_none()
    if not team:
        raise NotFoundError("球队不存在", "TEAM_NOT_FOUND")
    rows = (
        await db.execute(
            select(TeamMember, Player.name.label("player_name"))
            .join(Player, Player.id == TeamMember.player_id)
            .where(TeamMember.team_id == team_id)
            .order_by(TeamMember.id)
        )
    ).all()
    return {
        "data": [
            {
                "id": row[0].id,
                "player_id": row[0].player_id,
                "player_name": row.player_name,
                "role": row[0].role,
                "is_active": row[0].is_active,
            }
            for row in rows
        ]
    }


@router.put("/{team_id}/members")
async def save_members(
    team_id: int,
    body: SaveTeamMembersRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    team = (await db.execute(select(Team.id).where(Team.id == team_id))).scalar_one_or_none()
    if not team:
        raise NotFoundError("球队不存在", "TEAM_NOT_FOUND")
    player_ids = [member.player_id for member in body.members]
    if len(player_ids) != len(set(player_ids)):
        raise ConflictError("球队成员重复", "TEAM_MEMBER_DUPLICATED")
    if player_ids:
        existing = await db.execute(select(Player.id).where(Player.id.in_(player_ids)))
        if len(existing.scalars().all()) != len(player_ids):
            raise NotFoundError("球员不存在", "PLAYER_NOT_FOUND")

    await db.execute(delete(TeamMember).where(TeamMember.team_id == team_id))
    for member in body.members:
        db.add(
            TeamMember(
                team_id=team_id,
                player_id=member.player_id,
                role=member.role,
                is_active=member.is_active,
            )
        )
    await db.commit()
    return await get_members(team_id, db, None)
