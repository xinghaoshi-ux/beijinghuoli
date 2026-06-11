from pydantic import BaseModel, Field


class ItemBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    item_type: str = "individual"
    player_count: int = Field(default=1, ge=1, le=4)
    display_order: int | None = None
    sort_order: int | None = None
    note: str | None = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    item_type: str | None = None
    player_count: int | None = Field(default=None, ge=1, le=4)
    display_order: int | None = None
    sort_order: int | None = None
    note: str | None = None


class ItemOut(ItemBase):
    id: int
