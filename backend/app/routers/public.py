from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.services.match_service import MatchService

router = APIRouter(prefix="/api/v1/public", tags=["public"])


@router.get("/event-info")
async def event_info():
    return {
        "data": {
            "name": settings.EVENT_NAME,
            "subtitle": settings.EVENT_SUBTITLE,
            "description": None,
        }
    }


@router.get("/results")
async def public_results(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: str | None = None,
    item_id: int | None = None,
    team_id: int | None = None,
    player_id: int | None = None,
    match_date: str | None = None,
    match_month: str | None = None,
    age_group: str | None = None,
    group_name: str | None = None,
    db: AsyncSession = Depends(get_db),
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


@router.get("/matches")
async def public_matches(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: str | None = None,
    item_id: int | None = None,
    team_id: int | None = None,
    player_id: int | None = None,
    match_date: str | None = None,
    match_month: str | None = None,
    age_group: str | None = None,
    group_name: str | None = None,
    db: AsyncSession = Depends(get_db),
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


@router.get("/filter-options")
async def public_filter_options(
    match_month: str | None = None,
    team_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    return {"data": await MatchService(db).filter_options(match_month, team_id)}
