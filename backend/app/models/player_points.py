from typing import Optional

from sqlalchemy import ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class PlayerPoints(Base, TimestampMixin):
    __tablename__ = "player_points"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"))
    item_id: Mapped[int] = mapped_column(ForeignKey("competition_items.id"))
    match_result_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("match_results.id"), default=None
    )
    points: Mapped[int] = mapped_column(Integer)
    description: Mapped[Optional[str]] = mapped_column(String(500), default=None)

    __table_args__ = (Index("ix_player_points_player", "player_id"),)
