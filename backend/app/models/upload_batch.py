from typing import Optional

from sqlalchemy import JSON, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class UploadBatch(Base, TimestampMixin):
    __tablename__ = "upload_batches"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    total_rows: Mapped[Optional[int]] = mapped_column(Integer, default=None)
    valid_rows: Mapped[Optional[int]] = mapped_column(Integer, default=None)
    error_rows: Mapped[Optional[int]] = mapped_column(Integer, default=None)
    preview_data: Mapped[Optional[dict | list]] = mapped_column(JSON, default=None)
    error_log: Mapped[Optional[str]] = mapped_column(Text, default=None)
