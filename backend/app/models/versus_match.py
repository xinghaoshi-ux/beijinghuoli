from datetime import date
from typing import Optional

from sqlalchemy import Date, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class VersusMatch(Base, TimestampMixin):
    __tablename__ = "versus_matches"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    match_date: Mapped[Optional[date]] = mapped_column(Date, default=date.today)
    sequence_no: Mapped[Optional[int]] = mapped_column(Integer, default=None)
    court: Mapped[Optional[str]] = mapped_column(String(80), default=None)
    group_name: Mapped[Optional[str]] = mapped_column(String(80), default=None)
    item_id: Mapped[int] = mapped_column(ForeignKey("competition_items.id"))
    team_a_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))
    team_b_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))
    team_a_score: Mapped[int] = mapped_column(Integer)
    team_b_score: Mapped[int] = mapped_column(Integer)
    winner_team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))
    source_type: Mapped[str] = mapped_column(String(20), default="manual")
    upload_batch_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("upload_batches.id"), default=None
    )
    note: Mapped[Optional[str]] = mapped_column(String(500), default=None)

    __table_args__ = (
        Index("ix_versus_matches_item_id", "item_id"),
        Index("ix_versus_matches_match_date", "match_date"),
        Index("ix_versus_matches_team_a_id", "team_a_id"),
        Index("ix_versus_matches_team_b_id", "team_b_id"),
    )
