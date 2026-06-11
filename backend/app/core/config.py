from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./tennis_exchange.db"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12
    ADMIN_AUTH_ENABLED: bool = True
    ADMIN_INITIAL_USERNAME: str = "admin"
    ADMIN_INITIAL_PASSWORD: str = "admin123"
    UPLOAD_DIR: str = "./uploads"
    EVENT_NAME: str = "北京市活力网球交流系列赛"
    EVENT_SUBTITLE: str = "赛果查看平台"
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def get_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://") or url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://")
            if "+asyncpg" not in url:
                url = url.replace("postgresql://", "postgresql+asyncpg://")
        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
