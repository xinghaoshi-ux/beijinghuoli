from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class VersusMatchPlayer(Base, TimestampMixin):
    __tablename__ = "versus_match_players"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("versus_matches.id"))
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"))
    side: Mapped[str] = mapped_column(String(1))

    __table_args__ = (
        UniqueConstraint("match_id", "player_id", name="uq_versus_match_player"),
    )
