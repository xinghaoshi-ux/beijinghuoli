from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date, datetime

from pypinyin import Style, lazy_pinyin
from sqlalchemy import String, delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationAppError
from app.models.competition_item import CompetitionItem
from app.models.player import Player
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.versus_match import VersusMatch
from app.models.versus_match_player import VersusMatchPlayer
from app.schemas.result import VersusMatchCreate


@dataclass
class TeamRankingAccumulator:
    team_id: int
    team_name: str
    duel_win_count: int = 0
    duel_loss_count: int = 0
    set_win_count: int = 0
    set_loss_count: int = 0
    games_for: int = 0
    games_against: int = 0
    net_games: int = 0
    opponent_results: list[str] = field(default_factory=list)


@dataclass
class PlayerRankingAccumulator:
    player_id: int
    player_name: str
    team_id: int | None
    team_name: str | None
    appearance_count: int = 0
    set_win_count: int = 0
    set_loss_count: int = 0
    games_for: int = 0
    games_against: int = 0
    net_games: int = 0


class MatchService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_match(
        self,
        data: VersusMatchCreate,
        source_type: str = "manual",
        upload_batch_id: int | None = None,
    ) -> VersusMatch:
        item = await self._get_item(data.item_id) if data.item_id else None
        await self._validate_match(data, item)
        winner_team_id = self._winner_team_id(data)
        group_name = data.age_group or data.group_name
        match = VersusMatch(
            match_date=data.match_date or date.today(),
            sequence_no=data.sequence_no,
            court=data.court,
            group_name=group_name,
            item_id=data.item_id,
            item_name=data.item_name or (item.name if item else None),
            team_a_id=data.team_a_id,
            team_b_id=data.team_b_id,
            team_a_score=data.team_a_score,
            team_b_score=data.team_b_score,
            winner_team_id=winner_team_id,
            source_type=source_type,
            upload_batch_id=upload_batch_id,
            note=data.note,
        )
        self.db.add(match)
        await self.db.flush()
        await self._save_players(match.id, data)
        await self.db.commit()
        return match

    async def update_match(self, match_id: int, data: VersusMatchCreate) -> VersusMatch:
        match = await self._get_match(match_id)
        item = await self._get_item(data.item_id) if data.item_id else None
        await self._validate_match(data, item)
        await self.db.execute(
            delete(VersusMatchPlayer).where(VersusMatchPlayer.match_id == match_id)
        )
        match.match_date = data.match_date or match.match_date or date.today()
        match.sequence_no = data.sequence_no
        match.court = data.court
        match.group_name = data.age_group or data.group_name
        match.item_id = data.item_id
        match.item_name = data.item_name or (item.name if item else None)
        match.team_a_id = data.team_a_id
        match.team_b_id = data.team_b_id
        match.team_a_score = data.team_a_score
        match.team_b_score = data.team_b_score
        match.winner_team_id = self._winner_team_id(data)
        match.note = data.note
        await self._save_players(match.id, data)
        await self.db.commit()
        return match

    async def delete_match(self, match_id: int) -> None:
        match = await self._get_match(match_id)
        await self.db.execute(
            delete(VersusMatchPlayer).where(VersusMatchPlayer.match_id == match_id)
        )
        await self.db.delete(match)
        await self.db.commit()

    async def list_matches(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        item_id: int | None = None,
        team_id: int | None = None,
        match_date: date | str | None = None,
        match_month: str | None = None,
        age_group: str | None = None,
        player_id: int | None = None,
    ) -> tuple[list[dict], int]:
        base = select(VersusMatch.id)
        base = self._apply_match_filters(
            base,
            item_id=item_id,
            team_id=team_id,
            player_id=player_id,
            match_date=match_date,
            match_month=match_month,
            age_group=age_group,
        )
        if search and not _is_initials_search(search):
            base = self._apply_match_search(base, search)

        ordered_base = base.order_by(
            VersusMatch.match_date.is_(None),
            VersusMatch.match_date.desc(),
            VersusMatch.sequence_no.is_(None),
            VersusMatch.sequence_no,
            VersusMatch.id,
        )
        if search and _is_initials_search(search):
            rows = await self.db.execute(ordered_base)
            matches = [await self.format_match(row[0]) for row in rows.all()]
            matched = [match for match in matches if _match_search_text(match, search)]
            start = (page - 1) * page_size
            return matched[start : start + page_size], len(matched)

        total = (
            await self.db.execute(select(func.count()).select_from(base.subquery()))
        ).scalar_one()
        rows = await self.db.execute(
            base.order_by(
                VersusMatch.match_date.is_(None),
                VersusMatch.match_date.desc(),
                VersusMatch.sequence_no.is_(None),
                VersusMatch.sequence_no,
                VersusMatch.id,
            )
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        ids = [row[0] for row in rows.all()]
        return [await self.format_match(match_id) for match_id in ids], total

    async def format_match(self, match_id: int) -> dict:
        query = (
            select(
                VersusMatch,
                CompetitionItem.name.label("item_name"),
                TeamA.c.name.label("team_a_name"),
                TeamB.c.name.label("team_b_name"),
                Winner.c.name.label("winner_team_name"),
            )
            .outerjoin(CompetitionItem, CompetitionItem.id == VersusMatch.item_id)
            .join(TeamA, TeamA.c.id == VersusMatch.team_a_id)
            .join(TeamB, TeamB.c.id == VersusMatch.team_b_id)
            .join(Winner, Winner.c.id == VersusMatch.winner_team_id)
            .where(VersusMatch.id == match_id)
        )
        row = (await self.db.execute(query)).one()
        match = row[0]
        team_a_players = await self._get_match_players(match.id, "A")
        team_b_players = await self._get_match_players(match.id, "B")
        item_name = match.item_name or row.item_name
        return {
            "id": match.id,
            "match_date": match.match_date.isoformat() if match.match_date else None,
            "sequence_no": match.sequence_no,
            "court": match.court,
            "group_name": match.group_name,
            "age_group": match.group_name,
            "item_id": match.item_id,
            "item_name": item_name,
            "team_a_id": match.team_a_id,
            "team_a_name": row.team_a_name,
            "team_b_id": match.team_b_id,
            "team_b_name": row.team_b_name,
            "team_a_players": team_a_players,
            "team_b_players": team_b_players,
            "team_a_score": match.team_a_score,
            "team_b_score": match.team_b_score,
            "score_text": f"{match.team_a_score}:{match.team_b_score}",
            "winner_team_id": match.winner_team_id,
            "winner_team_name": row.winner_team_name,
            "note": match.note,
            "source_type": match.source_type,
            "upload_batch_id": match.upload_batch_id,
            "created_at": match.created_at.isoformat() if match.created_at else None,
        }

    async def team_rankings(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        team_id: int | None = None,
        match_date: date | str | None = None,
        match_month: str | None = None,
        age_group: str | None = None,
    ) -> tuple[list[dict], int]:
        rows = (await self.db.execute(select(Team.id, Team.name))).all()
        teams = {row.id: TeamRankingAccumulator(row.id, row.name) for row in rows}
        pair_scores: dict[tuple[int, int], dict[int, int]] = defaultdict(lambda: defaultdict(int))

        match_query = self._apply_match_filters(
            select(VersusMatch),
            match_date=match_date,
            match_month=match_month,
            age_group=age_group,
        )
        matches = (await self.db.execute(match_query)).scalars().all()
        for match in matches:
            if match.team_a_id not in teams or match.team_b_id not in teams:
                continue
            team_a = teams[match.team_a_id]
            team_b = teams[match.team_b_id]
            team_a.games_for += match.team_a_score
            team_a.games_against += match.team_b_score
            team_a.net_games += match.team_a_score - match.team_b_score
            team_b.games_for += match.team_b_score
            team_b.games_against += match.team_a_score
            team_b.net_games += match.team_b_score - match.team_a_score
            if match.winner_team_id == match.team_a_id:
                team_a.set_win_count += 1
                team_b.set_loss_count += 1
            else:
                team_b.set_win_count += 1
                team_a.set_loss_count += 1
            pair_key = tuple(sorted((match.team_a_id, match.team_b_id)))
            pair_scores[pair_key][match.team_a_id] += match.team_a_score
            pair_scores[pair_key][match.team_b_id] += match.team_b_score

        for pair_key, scores in pair_scores.items():
            team_1, team_2 = pair_key
            score_1 = scores[team_1]
            score_2 = scores[team_2]
            if score_1 == score_2:
                result_1 = f"{teams[team_2].team_name} {score_1}:{score_2} 平"
                result_2 = f"{teams[team_1].team_name} {score_2}:{score_1} 平"
            elif score_1 > score_2:
                teams[team_1].duel_win_count += 1
                teams[team_2].duel_loss_count += 1
                result_1 = f"{teams[team_2].team_name} {score_1}:{score_2} 胜"
                result_2 = f"{teams[team_1].team_name} {score_2}:{score_1} 负"
            else:
                teams[team_2].duel_win_count += 1
                teams[team_1].duel_loss_count += 1
                result_1 = f"{teams[team_2].team_name} {score_1}:{score_2} 负"
                result_2 = f"{teams[team_1].team_name} {score_2}:{score_1} 胜"
            teams[team_1].opponent_results.append(result_1)
            teams[team_2].opponent_results.append(result_2)

        items = [item for item in teams.values() if item.set_win_count or item.set_loss_count]
        items.sort(
            key=lambda item: (
                -item.duel_win_count,
                -item.set_win_count,
                -item.games_for,
                -item.net_games,
                item.team_name,
            )
        )
        ranked = self._rank_items(
            items,
            lambda item: (
                item.duel_win_count,
                item.set_win_count,
                item.games_for,
                item.net_games,
            ),
        )
        if search:
            pattern = _normalize_search(search)
            ranked = [item for item in ranked if pattern in _search_blob(item["team_name"])]
        if team_id:
            ranked = [item for item in ranked if item["team_id"] == team_id]
        return ranked[(page - 1) * page_size : page * page_size], len(ranked)

    async def player_rankings(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        scope: str = "global",
        team_id: int | None = None,
        match_date: date | str | None = None,
        match_month: str | None = None,
        age_group: str | None = None,
    ) -> tuple[list[dict], int]:
        query = (
            select(
                VersusMatch,
                VersusMatchPlayer,
                Player.name.label("player_name"),
                Team.name.label("team_name"),
            )
            .join(VersusMatchPlayer, VersusMatchPlayer.match_id == VersusMatch.id)
            .join(Player, Player.id == VersusMatchPlayer.player_id)
            .outerjoin(Team, Team.id == VersusMatchPlayer.team_id)
        )
        query = self._apply_match_filters(
            query,
            match_date=match_date,
            match_month=match_month,
            age_group=age_group,
        )
        rows = (await self.db.execute(query)).all()
        players: dict[int, PlayerRankingAccumulator] = {}
        for row in rows:
            match = row[0]
            match_player = row[1]
            player_score = match.team_a_score if match_player.side == "A" else match.team_b_score
            opponent_score = match.team_b_score if match_player.side == "A" else match.team_a_score
            current = players.setdefault(
                match_player.player_id,
                PlayerRankingAccumulator(
                    player_id=match_player.player_id,
                    player_name=row.player_name,
                    team_id=match_player.team_id,
                    team_name=row.team_name,
                ),
            )
            current.appearance_count += 1
            current.games_for += player_score
            current.games_against += opponent_score
            current.net_games += player_score - opponent_score
            if match.winner_team_id == match_player.team_id:
                current.set_win_count += 1
            else:
                current.set_loss_count += 1

        items = list(players.values())
        items.sort(
            key=lambda item: (
                -item.set_win_count,
                -item.games_for,
                -item.net_games,
                -item.appearance_count,
                item.player_name,
            )
        )
        ranked = self._rank_items(
            items,
            lambda item: (
                item.set_win_count,
                item.games_for,
                item.net_games,
                item.appearance_count,
            ),
        )
        for item in ranked:
            if scope == "team":
                item["team_rank"] = item["rank"]
            else:
                item["global_rank"] = item["rank"]
        if search:
            pattern = _normalize_search(search)
            ranked = [
                item
                for item in ranked
                if pattern in _search_blob(item["player_name"], _initials(item["player_name"]))
                or (item["team_name"] and pattern in _search_blob(item["team_name"]))
            ]
        if team_id:
            ranked = [item for item in ranked if item["team_id"] == team_id]
        return ranked[(page - 1) * page_size : page * page_size], len(ranked)

    async def filter_options(
        self,
        match_month: str | None = None,
        team_id: int | None = None,
    ) -> dict:
        month_query = self._apply_match_filters(
            select(VersusMatch.match_date).where(VersusMatch.match_date.is_not(None)),
            team_id=team_id,
        ).distinct()
        month_rows = (await self.db.execute(month_query)).scalars().all()
        months = sorted({value.strftime("%Y-%m") for value in month_rows}, reverse=True)

        date_query = select(VersusMatch.match_date).where(VersusMatch.match_date.is_not(None))
        date_query = self._apply_match_filters(
            date_query,
            team_id=team_id,
            match_month=match_month,
        ).distinct()
        date_rows = (await self.db.execute(date_query)).scalars().all()
        dates = sorted({value.isoformat() for value in date_rows}, reverse=True)

        team_rows = (await self.db.execute(select(Team.id, Team.name).order_by(Team.name))).all()
        group_query = select(VersusMatch.group_name).where(VersusMatch.group_name.is_not(None))
        group_query = self._apply_match_filters(
            group_query,
            team_id=team_id,
            match_month=match_month,
        ).distinct()
        group_rows = (await self.db.execute(group_query)).scalars().all()
        return {
            "match_months": months,
            "match_dates": dates,
            "teams": [
                {"id": row.id, "name": row.name, "short_name": row.name}
                for row in team_rows
            ],
            "age_groups": sorted({value for value in group_rows if value}),
        }

    def _rank_items(self, items: list, key_func) -> list[dict]:
        ranked = []
        previous_key = None
        current_rank = 0
        for item in items:
            current_key = key_func(item)
            if current_key != previous_key:
                current_rank += 1
            previous_key = current_key
            payload = item.__dict__.copy()
            payload["rank"] = current_rank
            payload["ranking"] = current_rank
            if "games_for" in payload:
                payload["total_score"] = payload["games_for"]
                payload["total_points"] = payload["games_for"]
            if "set_win_count" in payload:
                payload["win_count"] = payload["set_win_count"]
            if "appearance_count" in payload:
                payload["result_count"] = payload["appearance_count"]
            elif "set_win_count" in payload:
                payload["result_count"] = payload["set_win_count"] + payload["set_loss_count"]
            if "set_win_count" in payload:
                payload["match_win_count"] = payload["set_win_count"]
                payload["match_loss_count"] = payload["set_loss_count"]
            ranked.append(payload)
        return ranked

    def _winner_team_id(self, data: VersusMatchCreate) -> int:
        if data.team_a_score == data.team_b_score:
            raise ValidationAppError("比分不能为平局", "MATCH_SCORE_TIE_INVALID")
        return data.team_a_id if data.team_a_score > data.team_b_score else data.team_b_id

    def _apply_match_filters(
        self,
        query,
        item_id: int | None = None,
        team_id: int | None = None,
        player_id: int | None = None,
        match_date: date | str | None = None,
        match_month: str | None = None,
        age_group: str | None = None,
        player_team_field=None,
    ):
        if item_id:
            query = query.where(VersusMatch.item_id == item_id)
        if team_id:
            if player_team_field is not None:
                query = query.where(player_team_field == team_id)
            else:
                query = query.where(
                    or_(VersusMatch.team_a_id == team_id, VersusMatch.team_b_id == team_id)
                )
        if player_id:
            player_matches = select(VersusMatchPlayer.match_id).where(
                VersusMatchPlayer.player_id == player_id
            )
            query = query.where(VersusMatch.id.in_(player_matches))
        parsed_date = self._parse_date(match_date)
        if parsed_date:
            query = query.where(VersusMatch.match_date == parsed_date)
        if match_month:
            start, end = self._month_range(match_month)
            query = query.where(VersusMatch.match_date >= start, VersusMatch.match_date < end)
        if age_group:
            query = query.where(VersusMatch.group_name == age_group)
        return query

    def _parse_date(self, value: date | str | None) -> date | None:
        if value is None or isinstance(value, date):
            return value
        return datetime.strptime(value, "%Y-%m-%d").date()

    def _month_range(self, value: str) -> tuple[date, date]:
        start = datetime.strptime(value, "%Y-%m").date()
        if start.month == 12:
            end = date(start.year + 1, 1, 1)
        else:
            end = date(start.year, start.month + 1, 1)
        return start, end

    async def _validate_match(self, data: VersusMatchCreate, item: CompetitionItem | None) -> None:
        if data.team_a_id == data.team_b_id:
            raise ValidationAppError("对阵球队不能相同", "MATCH_TEAM_DUPLICATED")
        await self._ensure_team(data.team_a_id)
        await self._ensure_team(data.team_b_id)
        self._winner_team_id(data)
        player_count = item.player_count if item else 1
        a_players = data.team_a_player_ids or []
        b_players = data.team_b_player_ids or []
        if item and len(a_players) != player_count:
            raise ValidationAppError(
                "A 队球员人数与项目人数不匹配",
                "MATCH_TEAM_A_PLAYER_COUNT_INVALID",
            )
        if item and len(b_players) != player_count:
            raise ValidationAppError(
                "B 队球员人数与项目人数不匹配",
                "MATCH_TEAM_B_PLAYER_COUNT_INVALID",
            )
        all_player_ids = a_players + b_players
        if all_player_ids and len(all_player_ids) != len(set(all_player_ids)):
            raise ConflictError("同一场比赛球员不能重复", "MATCH_PLAYER_DUPLICATED")
        if a_players:
            await self._validate_side_players(a_players, data.team_a_id)
        if b_players:
            await self._validate_side_players(b_players, data.team_b_id)

    async def _save_players(self, match_id: int, data: VersusMatchCreate) -> None:
        for player_id in (data.team_a_player_ids or []):
            self.db.add(
                VersusMatchPlayer(
                    match_id=match_id, team_id=data.team_a_id, player_id=player_id, side="A"
                )
            )
        for player_id in (data.team_b_player_ids or []):
            self.db.add(
                VersusMatchPlayer(
                    match_id=match_id, team_id=data.team_b_id, player_id=player_id, side="B"
                )
            )
        await self.db.flush()

    async def _get_item(self, item_id: int) -> CompetitionItem:
        item = (
            await self.db.execute(select(CompetitionItem).where(CompetitionItem.id == item_id))
        ).scalar_one_or_none()
        if not item:
            raise NotFoundError("比赛项目不存在", "ITEM_NOT_FOUND")
        return item

    async def _get_match(self, match_id: int) -> VersusMatch:
        match = (
            await self.db.execute(select(VersusMatch).where(VersusMatch.id == match_id))
        ).scalar_one_or_none()
        if not match:
            raise NotFoundError("比赛结果不存在", "MATCH_NOT_FOUND")
        return match

    async def _ensure_team(self, team_id: int) -> None:
        team = (
            await self.db.execute(select(Team.id).where(Team.id == team_id))
        ).scalar_one_or_none()
        if not team:
            raise NotFoundError("球队不存在", "TEAM_NOT_FOUND")

    async def _validate_side_players(self, player_ids: list[int], team_id: int) -> None:
        rows = (
            await self.db.execute(
                select(Player.id, Player.team_id)
                .where(Player.id.in_(player_ids))
            )
        ).all()
        if len(rows) != len(player_ids):
            raise NotFoundError("球员不存在", "PLAYER_NOT_FOUND")
        for row in rows:
            if row.team_id == team_id:
                continue
            member = (
                await self.db.execute(
                    select(TeamMember.id).where(
                        TeamMember.team_id == team_id,
                        TeamMember.player_id == row.id,
                        TeamMember.is_active.is_(True),
                    )
                )
            ).scalar_one_or_none()
            if not member:
                raise ConflictError("球员不属于当前球队", "MATCH_PLAYER_TEAM_MISMATCH")

    async def _get_match_players(self, match_id: int, side: str) -> list[dict]:
        rows = (
            await self.db.execute(
                select(
                    Player.id,
                    Player.name,
                    VersusMatchPlayer.team_id,
                    Team.name.label("team_name"),
                )
                .join(VersusMatchPlayer, VersusMatchPlayer.player_id == Player.id)
                .join(Team, Team.id == VersusMatchPlayer.team_id)
                .where(
                    VersusMatchPlayer.match_id == match_id,
                    VersusMatchPlayer.side == side,
                )
                .order_by(VersusMatchPlayer.id)
            )
        ).all()
        return [
            {
                "id": row.id,
                "name": row.name,
                "team_id": row.team_id,
                "team_name": row.team_name,
            }
            for row in rows
        ]

    def _apply_match_search(self, query, search: str):
        pattern = f"%{search}%"
        return (
            query.join(CompetitionItem, CompetitionItem.id == VersusMatch.item_id)
            .join(TeamA, TeamA.c.id == VersusMatch.team_a_id)
            .join(TeamB, TeamB.c.id == VersusMatch.team_b_id)
            .join(Winner, Winner.c.id == VersusMatch.winner_team_id)
            .outerjoin(VersusMatchPlayer, VersusMatchPlayer.match_id == VersusMatch.id)
            .outerjoin(Player, Player.id == VersusMatchPlayer.player_id)
            .where(
                or_(
                    CompetitionItem.name.ilike(pattern),
                    TeamA.c.name.ilike(pattern),
                    TeamB.c.name.ilike(pattern),
                    Winner.c.name.ilike(pattern),
                    Player.name.ilike(pattern),
                    VersusMatch.court.ilike(pattern),
                    VersusMatch.group_name.ilike(pattern),
                    VersusMatch.note.ilike(pattern),
                    (
                        VersusMatch.team_a_score.cast(String)
                        + ":"
                        + VersusMatch.team_b_score.cast(String)
                    ).ilike(pattern),
                )
            )
            .distinct()
        )


TeamA = Team.__table__.alias("team_a")
TeamB = Team.__table__.alias("team_b")
Winner = Team.__table__.alias("winner")


def _initials(value: str | None) -> str:
    if not value:
        return ""
    return " ".join(lazy_pinyin(value, style=Style.FIRST_LETTER)).upper()


def _normalize_search(value: str) -> str:
    return " ".join(value.lower().split())


def _is_initials_search(value: str) -> bool:
    normalized = value.replace(" ", "")
    return normalized.isascii() and normalized.isalpha()


def _search_blob(*values: str | None) -> str:
    normalized_values = [_normalize_search(value) for value in values if value]
    compact_values = [value.replace(" ", "") for value in normalized_values]
    return " ".join(normalized_values + compact_values)


def _match_search_text(match: dict, search: str) -> bool:
    pattern = _normalize_search(search)
    player_initials = [
        _initials(player["name"])
        for player in [*match["team_a_players"], *match["team_b_players"]]
    ]
    values = [
        match.get("item_name"),
        match.get("team_a_name"),
        match.get("team_b_name"),
        match.get("winner_team_name"),
        match.get("court"),
        match.get("age_group") or match.get("group_name"),
        match.get("score_text"),
        match.get("note"),
        *[player["name"] for player in [*match["team_a_players"], *match["team_b_players"]]],
        *player_initials,
    ]
    return pattern in _search_blob(*values)
