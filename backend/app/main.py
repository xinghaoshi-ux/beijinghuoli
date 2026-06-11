from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import SessionLocal, init_db
from app.core.exceptions import AppException, app_exception_handler
from app.routers import (
    auth,
    dashboard,
    health,
    items,
    matches,
    players,
    public,
    rankings,
    results,
    teams,
    uploads,
)
from app.services.startup import ensure_initial_admin


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    async with SessionLocal() as db:
        await ensure_initial_admin(db)
    yield


app = FastAPI(
    title="Tennis Exchange Results API",
    version="0.1.0",
    lifespan=lifespan,
)

origins = ["*"] if settings.CORS_ORIGINS == "*" else settings.CORS_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppException, app_exception_handler)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(players.router)
app.include_router(teams.router)
app.include_router(items.router)
app.include_router(results.router)
app.include_router(matches.router)
app.include_router(uploads.router)
app.include_router(rankings.public_router)
app.include_router(rankings.admin_router)
app.include_router(public.router)
app.include_router(dashboard.router)
