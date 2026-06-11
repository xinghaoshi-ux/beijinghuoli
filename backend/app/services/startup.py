from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.models.admin_user import AdminUser


async def ensure_initial_admin(db: AsyncSession) -> None:
    result = await db.execute(
        select(AdminUser).where(AdminUser.username == settings.ADMIN_INITIAL_USERNAME)
    )
    if result.scalar_one_or_none():
        return
    db.add(
        AdminUser(
            username=settings.ADMIN_INITIAL_USERNAME,
            password_hash=hash_password(settings.ADMIN_INITIAL_PASSWORD),
            display_name="管理员",
            status="active",
        )
    )
    await db.commit()
