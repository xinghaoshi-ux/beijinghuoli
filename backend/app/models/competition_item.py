from typing import Optional

from sqlalchemy import Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class CompetitionItem(Base, TimestampMixin):
    __tablename__ = "competition_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    item_type: Mapped[str] = mapped_column(String(20), default="individual")
    player_count: Mapped[int] = mapped_column(Integer, default=1)
    display_order: Mapped[Optional[int]] = mapped_column(Integer, default=None)
    sort_order: Mapped[Optional[int]] = mapped_column(Integer, default=None)
    note: Mapped[Optional[str]] = mapped_column(String(500), default=None)

    __table_args__ = (Index("ix_competition_items_name", "name"),)
