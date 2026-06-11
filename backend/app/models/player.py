from typing import Optional

from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class Player(Base, TimestampMixin):
    __tablename__ = "players"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    team_id: Mapped[Optional[int]] = mapped_column(ForeignKey("teams.id"), default=None)
    phone: Mapped[Optional[str]] = mapped_column(String(40), default=None)
    note: Mapped[Optional[str]] = mapped_column(String(500), default=None)
    status: Mapped[str] = mapped_column(String(20), default="active")

    __table_args__ = (Index("ix_players_name", "name"),)
