from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.exceptions import AppException
from app.core.security import create_access_token, verify_password
from app.models.admin_user import AdminUser
from app.schemas.auth import LoginRequest

router = APIRouter(prefix="/api/v1/admin/auth", tags=["auth"])


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = (
        await db.execute(select(AdminUser).where(AdminUser.username == body.username))
    ).scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise AppException("用户名或密码错误", "AUTH_LOGIN_FAILED", 401)
    if user.status != "active":
        raise AppException("用户已停用", "AUTH_USER_DISABLED", 403)
    token = create_access_token(user.username)
    return {
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "display_name": user.display_name,
            },
        }
    }


@router.get("/me")
async def me(user: AdminUser | None = Depends(get_current_user)):
    if user is None:
        return {"data": None}
    return {
        "data": {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
        }
    }
