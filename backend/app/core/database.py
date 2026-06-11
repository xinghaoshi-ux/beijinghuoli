from collections.abc import AsyncGenerator

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


db_url = settings.get_database_url()
is_postgres = db_url.startswith("postgresql")

engine_kwargs = {"future": True}
if is_postgres:
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10
else:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_async_engine(db_url, **engine_kwargs)
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session


async def init_db() -> None:
    from app import models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(_ensure_compatible_schema)


async def drop_db() -> None:
    from app import models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


def _ensure_compatible_schema(sync_conn) -> None:
    inspector = inspect(sync_conn)
    tables = inspector.get_table_names()
    if "versus_matches" not in tables:
        return
    columns = {column["name"] for column in inspector.get_columns("versus_matches")}
    if "match_date" not in columns:
        sync_conn.execute(text("ALTER TABLE versus_matches ADD COLUMN match_date DATE"))
    if "item_name" not in columns:
        sync_conn.execute(text("ALTER TABLE versus_matches ADD COLUMN item_name VARCHAR(100)"))
