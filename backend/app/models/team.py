from typing import Optional

from sqlalchemy import Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class Team(Base, TimestampMixin):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    note: Mapped[Optional[str]] = mapped_column(String(500), default=None)
    status: Mapped[str] = mapped_column(String(20), default="active")

    __table_args__ = (Index("ix_teams_name", "name"),)
