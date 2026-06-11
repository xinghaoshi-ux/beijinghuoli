from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationAppError
from app.models.competition_item import CompetitionItem
from app.models.match_result import MatchResult
from app.models.match_result_player import MatchResultPlayer
from app.models.player import Player
from app.models.player_points import PlayerPoints
from app.models.team import Team
from app.models.team_points import TeamPoints
from app.schemas.result import MatchResultCreate


class ResultService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_result(
        self,
        data: MatchResultCreate,
        source_type: str = "manual",
        upload_batch_id: int | None = None,
    ) -> MatchResult:
        item = await self._get_item(data.item_id)
        await self._validate_scope(data, item)

        result = MatchResult(
            item_id=data.item_id,
            result_scope=data.result_scope,
            rank_label=data.rank_label,
            rank_order=data.rank_order,
            team_id=data.team_id,
            score_text=data.score_text,
            points=data.points,
            source_type=source_type,
            upload_batch_id=upload_batch_id,
            note=data.note,
        )
        self.db.add(result)
        await self.db.flush()

        if data.result_scope == "individual":
            for player_id in data.player_ids:
                self.db.add(MatchResultPlayer(match_result_id=result.id, player_id=player_id))
        await self.db.flush()
        await self._create_points(result, data.player_ids)
        await self.db.commit()
        return result

    async def update_result(self, result_id: int, data: MatchResultCreate) -> MatchResult:
        result = await self._get_result(result_id)
        item = await self._get_item(data.item_id)
        await self._validate_scope(data, item)

        await self._delete_points(result_id)
        await self.db.execute(
            delete(MatchResultPlayer).where(MatchResultPlayer.match_result_id == result_id)
        )

        result.item_id = data.item_id
        result.result_scope = data.result_scope
        result.rank_label = data.rank_label
        result.rank_order = data.rank_order
        result.team_id = data.team_id
        result.score_text = data.score_text
        result.points = data.points
        result.note = data.note

        if data.result_scope == "individual":
            for player_id in data.player_ids:
                self.db.add(MatchResultPlayer(match_result_id=result.id, player_id=player_id))

        await self.db.flush()
        await self._create_points(result, data.player_ids)
        await self.db.commit()
        return result

    async def delete_result(self, result_id: int) -> None:
        result = await self._get_result(result_id)
        await self._delete_points(result_id)
        await self.db.execute(
            delete(MatchResultPlayer).where(MatchResultPlayer.match_result_id == result_id)
        )
        await self.db.delete(result)
        await self.db.commit()

    async def list_results(
        self, page: int, page_size: int, search: str | None = None, scope: str | None = None
    ) -> tuple[list[dict], int]:
        base = select(MatchResult.id)
        if scope:
            base = base.where(MatchResult.result_scope == scope)
        if search:
            base = self._apply_result_search(base, search)

        count_query = select(func.count()).select_from(base.subquery())
        total = (await self.db.execute(count_query)).scalar_one()

        id_rows = await self.db.execute(
            base.order_by(MatchResult.rank_order.is_(None), MatchResult.rank_order, MatchResult.id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        ids = [row[0] for row in id_rows.all()]
        if not ids:
            return [], total
        return [await self.format_result(result_id) for result_id in ids], total

    async def format_result(self, result_id: int) -> dict:
        query = (
            select(
                MatchResult,
                CompetitionItem.name.label("item_name"),
                Team.id.label("team_id"),
                Team.name.label("team_name"),
            )
            .join(CompetitionItem, CompetitionItem.id == MatchResult.item_id)
            .outerjoin(Team, Team.id == MatchResult.team_id)
            .where(MatchResult.id == result_id)
        )
        row = (await self.db.execute(query)).one()
        result = row[0]
        players = await self._get_result_players(result.id)
        team = {"id": row.team_id, "name": row.team_name} if row.team_id else None
        return {
            "id": result.id,
            "item_id": result.item_id,
            "item_name": row.item_name,
            "result_scope": result.result_scope,
            "rank_label": result.rank_label,
            "rank_order": result.rank_order,
            "players": players,
            "team": team,
            "score_text": result.score_text,
            "points": result.points,
            "note": result.note,
            "source_type": result.source_type,
            "upload_batch_id": result.upload_batch_id,
            "created_at": result.created_at.isoformat() if result.created_at else None,
        }

    def _apply_result_search(self, query, search: str):
        pattern = f"%{search}%"
        return (
            query.join(CompetitionItem, CompetitionItem.id == MatchResult.item_id)
            .outerjoin(Team, Team.id == MatchResult.team_id)
            .outerjoin(MatchResultPlayer, MatchResultPlayer.match_result_id == MatchResult.id)
            .outerjoin(Player, Player.id == MatchResultPlayer.player_id)
            .where(
                or_(
                    CompetitionItem.name.ilike(pattern),
                    Team.name.ilike(pattern),
                    Player.name.ilike(pattern),
                    MatchResult.rank_label.ilike(pattern),
                    MatchResult.note.ilike(pattern),
                )
            )
            .distinct()
        )

    async def _get_item(self, item_id: int) -> CompetitionItem:
        item = (
            await self.db.execute(
                select(CompetitionItem).where(CompetitionItem.id == item_id)
            )
        ).scalar_one_or_none()
        if not item:
            raise NotFoundError("比赛项目不存在", "ITEM_NOT_FOUND")
        return item

    async def _get_result(self, result_id: int) -> MatchResult:
        result = (
            await self.db.execute(select(MatchResult).where(MatchResult.id == result_id))
        ).scalar_one_or_none()
        if not result:
            raise NotFoundError("成绩不存在", "RESULT_NOT_FOUND")
        return result

    async def _validate_scope(self, data: MatchResultCreate, item: CompetitionItem) -> None:
        if data.result_scope not in ("individual", "team"):
            raise ValidationAppError("结果范围无效", "RESULT_SCOPE_INVALID")
        if item.item_type != data.result_scope:
            raise ConflictError("结果范围与项目类型不匹配", "RESULT_SCOPE_ITEM_MISMATCH")
        if data.points < 0:
            raise ValidationAppError("积分无效", "RESULT_POINTS_INVALID")
        if data.result_scope == "individual":
            if not data.player_ids:
                raise ValidationAppError("个人结果必须选择球员", "RESULT_PLAYER_REQUIRED")
            existing = await self.db.execute(
                select(Player.id).where(Player.id.in_(data.player_ids))
            )
            if len(existing.scalars().all()) != len(set(data.player_ids)):
                raise NotFoundError("球员不存在", "PLAYER_NOT_FOUND")
        if data.result_scope == "team":
            if not data.team_id:
                raise ValidationAppError("球队结果必须选择球队", "RESULT_TEAM_REQUIRED")
            team = (
                await self.db.execute(select(Team.id).where(Team.id == data.team_id))
            ).scalar_one_or_none()
            if not team:
                raise NotFoundError("球队不存在", "TEAM_NOT_FOUND")

    async def _create_points(self, result: MatchResult, player_ids: list[int]) -> None:
        description = " ".join(
            part for part in [result.rank_label, f"{result.points} 分"] if part
        )
        if result.result_scope == "individual":
            for player_id in player_ids:
                self.db.add(
                    PlayerPoints(
                        player_id=player_id,
                        item_id=result.item_id,
                        match_result_id=result.id,
                        points=result.points,
                        description=description,
                    )
                )
        else:
            self.db.add(
                TeamPoints(
                    team_id=result.team_id,
                    item_id=result.item_id,
                    match_result_id=result.id,
                    points=result.points,
                    description=description,
                )
            )
        await self.db.flush()

    async def _delete_points(self, result_id: int) -> None:
        await self.db.execute(delete(PlayerPoints).where(PlayerPoints.match_result_id == result_id))
        await self.db.execute(delete(TeamPoints).where(TeamPoints.match_result_id == result_id))

    async def _get_result_players(self, result_id: int) -> list[dict]:
        query = (
            select(Player.id, Player.name, Team.name.label("team_name"))
            .join(MatchResultPlayer, MatchResultPlayer.player_id == Player.id)
            .outerjoin(Team, Team.id == Player.team_id)
            .where(MatchResultPlayer.match_result_id == result_id)
        )
        rows = (await self.db.execute(query)).all()
        return [{"id": row.id, "name": row.name, "team_name": row.team_name} for row in rows]
