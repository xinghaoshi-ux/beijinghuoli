from typing import Optional

from sqlalchemy import ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class MatchResult(Base, TimestampMixin):
    __tablename__ = "match_results"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("competition_items.id"))
    result_scope: Mapped[str] = mapped_column(String(20))
    rank_label: Mapped[Optional[str]] = mapped_column(String(80), default=None)
    rank_order: Mapped[Optional[int]] = mapped_column(Integer, default=None)
    team_id: Mapped[Optional[int]] = mapped_column(ForeignKey("teams.id"), default=None)
    score_text: Mapped[Optional[str]] = mapped_column(String(100), default=None)
    points: Mapped[int] = mapped_column(Integer)
    source_type: Mapped[str] = mapped_column(String(20), default="manual")
    upload_batch_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("upload_batches.id"), default=None
    )
    note: Mapped[Optional[str]] = mapped_column(String(500), default=None)

    __table_args__ = (
        Index("ix_match_results_item_id", "item_id"),
        Index("ix_match_results_scope", "result_scope"),
    )
