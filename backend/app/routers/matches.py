from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.result import VersusMatchCreate
from app.services.match_service import MatchService

router = APIRouter(prefix="/api/v1/admin/matches", tags=["matches"])


@router.get("")
async def list_matches(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    item_id: int | None = None,
    team_id: int | None = None,
    player_id: int | None = None,
    match_date: str | None = None,
    match_month: str | None = None,
    age_group: str | None = None,
    group_name: str | None = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    items, total = await MatchService(db).list_matches(
        page,
        page_size,
        search,
        item_id,
        team_id,
        match_date,
        match_month,
        age_group or group_name,
        player_id,
    )
    return {"data": items, "total": total, "page": page, "page_size": page_size}


@router.post("", status_code=201)
async def create_match(
    body: VersusMatchCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    service = MatchService(db)
    match = await service.create_match(body)
    return {"data": await service.format_match(match.id), "message": "ok"}


@router.put("/{match_id}")
async def update_match(
    match_id: int,
    body: VersusMatchCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    service = MatchService(db)
    match = await service.update_match(match_id, body)
    return {"data": await service.format_match(match.id), "message": "ok"}


@router.delete("/{match_id}")
async def delete_match(
    match_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    await MatchService(db).delete_match(match_id)
    return {"message": "ok"}
