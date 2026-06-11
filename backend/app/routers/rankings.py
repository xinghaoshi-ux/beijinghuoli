from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.services.match_service import MatchService

admin_router = APIRouter(prefix="/api/v1/admin/rankings", tags=["admin-rankings"])
public_router = APIRouter(prefix="/api/v1/public/rankings", tags=["public-rankings"])


async def get_player_rankings(
    db: AsyncSession,
    page: int,
    page_size: int,
    search: str | None = None,
    scope: str = "global",
    team_id: int | None = None,
    match_date: str | None = None,
    match_month: str | None = None,
    age_group: str | None = None,
) -> tuple[list[dict], int]:
    return await MatchService(db).player_rankings(
        page, page_size, search, scope, team_id, match_date, match_month, age_group
    )


async def get_team_rankings(
    db: AsyncSession,
    page: int,
    page_size: int,
    search: str | None = None,
    team_id: int | None = None,
    match_date: str | None = None,
    match_month: str | None = None,
    age_group: str | None = None,
) -> tuple[list[dict], int]:
    return await MatchService(db).team_rankings(
        page, page_size, search, team_id, match_date, match_month, age_group
    )


@public_router.get("/players")
async def public_player_rankings(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: str | None = None,
    scope: str = Query("global", pattern="^(global|team)$"),
    team_id: int | None = None,
    match_date: str | None = None,
    match_month: str | None = None,
    age_group: str | None = None,
    group_name: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    _ensure_team_scope(scope, team_id)
    items, total = await get_player_rankings(
        db,
        page,
        page_size,
        search,
        scope,
        team_id,
        match_date,
        match_month,
        age_group or group_name,
    )
    return {"data": items, "total": total, "page": page, "page_size": page_size}


@public_router.get("/teams")
async def public_team_rankings(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: str | None = None,
    team_id: int | None = None,
    match_date: str | None = None,
    match_month: str | None = None,
    age_group: str | None = None,
    group_name: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    items, total = await get_team_rankings(
        db, page, page_size, search, team_id, match_date, match_month, age_group or group_name
    )
    return {"data": items, "total": total, "page": page, "page_size": page_size}


@admin_router.get("/players")
async def admin_player_rankings(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: str | None = None,
    scope: str = Query("global", pattern="^(global|team)$"),
    team_id: int | None = None,
    match_date: str | None = None,
    match_month: str | None = None,
    age_group: str | None = None,
    group_name: str | None = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    _ensure_team_scope(scope, team_id)
    items, total = await get_player_rankings(
        db,
        page,
        page_size,
        search,
        scope,
        team_id,
        match_date,
        match_month,
        age_group or group_name,
    )
    return {"data": items, "total": total, "page": page, "page_size": page_size}


@admin_router.get("/teams")
async def admin_team_rankings(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: str | None = None,
    team_id: int | None = None,
    match_date: str | None = None,
    match_month: str | None = None,
    age_group: str | None = None,
    group_name: str | None = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    items, total = await get_team_rankings(
        db, page, page_size, search, team_id, match_date, match_month, age_group or group_name
    )
    return {"data": items, "total": total, "page": page, "page_size": page_size}


def _ensure_team_scope(scope: str, team_id: int | None) -> None:
    if scope == "team" and team_id is None:
        raise HTTPException(status_code=422, detail="scope=team 时 team_id 必填")
