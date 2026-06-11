from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.exceptions import ConflictError, NotFoundError, ValidationAppError
from app.models.competition_item import CompetitionItem
from app.schemas.item import ItemCreate, ItemUpdate

router = APIRouter(prefix="/api/v1/admin/items", tags=["items"])


def _item_data(item: CompetitionItem) -> dict:
    return {
        "id": item.id,
        "name": item.name,
        "item_type": item.item_type,
        "player_count": item.player_count,
        "display_order": item.display_order,
        "sort_order": item.sort_order,
        "note": item.note,
    }


@router.get("")
async def list_items(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    items = (
        await db.execute(
            select(CompetitionItem).order_by(
                CompetitionItem.sort_order.is_(None),
                CompetitionItem.sort_order,
                CompetitionItem.display_order.is_(None),
                CompetitionItem.display_order,
                CompetitionItem.id,
            )
        )
    ).scalars().all()
    return {"data": [_item_data(item) for item in items]}


@router.post("", status_code=201)
async def create_item(
    body: ItemCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    if body.item_type not in ("individual", "team"):
        raise ValidationAppError("项目类型无效", "ITEM_TYPE_INVALID")
    data = body.model_dump()
    if data.get("sort_order") is None:
        data["sort_order"] = data.get("display_order")
    item = CompetitionItem(**data)
    db.add(item)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise ConflictError("项目名称重复", "ITEM_NAME_DUPLICATED") from exc
    await db.refresh(item)
    return {"data": _item_data(item), "message": "ok"}


@router.put("/{item_id}")
async def update_item(
    item_id: int,
    body: ItemUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    item = (
        await db.execute(select(CompetitionItem).where(CompetitionItem.id == item_id))
    ).scalar_one_or_none()
    if not item:
        raise NotFoundError("比赛项目不存在", "ITEM_NOT_FOUND")
    data = body.model_dump(exclude_unset=True)
    if "item_type" in data and data["item_type"] not in ("individual", "team"):
        raise ValidationAppError("项目类型无效", "ITEM_TYPE_INVALID")
    if "display_order" in data and "sort_order" not in data:
        data["sort_order"] = data["display_order"]
    for key, value in data.items():
        setattr(item, key, value)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise ConflictError("项目名称重复", "ITEM_NAME_DUPLICATED") from exc
    await db.refresh(item)
    return {"data": _item_data(item), "message": "ok"}
