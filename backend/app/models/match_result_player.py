from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class MatchResultPlayer(Base, TimestampMixin):
    __tablename__ = "match_result_players"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    match_result_id: Mapped[int] = mapped_column(ForeignKey("match_results.id"))
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"))

    __table_args__ = (
        UniqueConstraint("match_result_id", "player_id", name="uq_result_player"),
    )
