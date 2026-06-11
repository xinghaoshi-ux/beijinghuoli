from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import AppException
from app.core.security import decode_access_token
from app.models.admin_user import AdminUser

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> AdminUser | None:
    if not settings.ADMIN_AUTH_ENABLED:
        return None
    if not credentials:
        raise AppException("缺少 Token", "AUTH_TOKEN_MISSING", 401)
    try:
        payload = decode_access_token(credentials.credentials)
    except JWTError as exc:
        raise AppException("Token 无效", "AUTH_TOKEN_INVALID", 401) from exc

    username = payload.get("sub")
    if not username:
        raise AppException("Token 无效", "AUTH_TOKEN_INVALID", 401)

    result = await db.execute(select(AdminUser).where(AdminUser.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise AppException("Token 无效", "AUTH_TOKEN_INVALID", 401)
    if user.status != "active":
        raise AppException("用户已停用", "AUTH_USER_DISABLED", 403)
    return user
