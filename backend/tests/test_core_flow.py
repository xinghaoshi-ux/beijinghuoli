import pytest
from httpx import AsyncClient


async def create_base_data(client: AsyncClient, auth_headers: dict):
    team_a = (
        await client.post("/api/v1/admin/teams", json={"name": "住建部队"}, headers=auth_headers)
    ).json()["data"]
    team_b = (
        await client.post("/api/v1/admin/teams", json={"name": "人社部队"}, headers=auth_headers)
    ).json()["data"]
    p1 = (
        await client.post(
            "/api/v1/admin/players",
            json={"name": "张三", "team_id": team_a["id"]},
            headers=auth_headers,
        )
    ).json()["data"]
    p2 = (
        await client.post(
            "/api/v1/admin/players",
            json={"name": "李四", "team_id": team_a["id"]},
            headers=auth_headers,
        )
    ).json()["data"]
    p3 = (
        await client.post(
            "/api/v1/admin/players",
            json={"name": "王五", "team_id": team_b["id"]},
            headers=auth_headers,
        )
    ).json()["data"]
    p4 = (
        await client.post(
            "/api/v1/admin/players",
            json={"name": "赵六", "team_id": team_b["id"]},
            headers=auth_headers,
        )
    ).json()["data"]
    item = (
        await client.post(
            "/api/v1/admin/items",
            json={
                "name": "男子双打",
                "item_type": "individual",
                "player_count": 2,
                "sort_order": 1,
            },
            headers=auth_headers,
        )
    ).json()["data"]
    return team_a, team_b, p1, p2, p3, p4, item


@pytest.mark.asyncio
async def test_admin_data_and_rankings(client: AsyncClient, auth_headers: dict):
    team_a, team_b, p1, p2, p3, p4, item = await create_base_data(client, auth_headers)

    members_response = await client.put(
        f"/api/v1/admin/teams/{team_a['id']}/members",
        json={"members": [{"player_id": p1["id"]}, {"player_id": p2["id"], "role": "captain"}]},
        headers=auth_headers,
    )
    assert members_response.status_code == 200
    assert len(members_response.json()["data"]) == 2

    response = await client.post(
        "/api/v1/admin/matches",
        json={
            "match_date": "2026-06-09",
            "sequence_no": 1,
            "court": "1 号场",
            "group_name": "A 组",
            "item_id": item["id"],
            "team_a_id": team_a["id"],
            "team_b_id": team_b["id"],
            "team_a_player_ids": [p1["id"], p2["id"]],
            "team_b_player_ids": [p3["id"], p4["id"]],
            "team_a_score": 6,
            "team_b_score": 4,
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    assert response.json()["data"]["score_text"] == "6:4"
    assert response.json()["data"]["winner_team_name"] == "住建部队"

    compatibility_response = await client.post(
        "/api/v1/admin/results",
        json={
            "match_date": "2026-06-16",
            "sequence_no": 2,
            "group_name": "B 组",
            "item_id": item["id"],
            "team_a_id": team_b["id"],
            "team_b_id": team_a["id"],
            "team_a_player_ids": [p3["id"], p4["id"]],
            "team_b_player_ids": [p1["id"], p2["id"]],
            "team_a_score": 3,
            "team_b_score": 7,
        },
        headers=auth_headers,
    )
    assert compatibility_response.status_code == 201

    player_rankings = await client.get("/api/v1/public/rankings/players")
    assert player_rankings.status_code == 200
    players = player_rankings.json()["data"]
    assert players[0]["rank"] == 1
    assert players[0]["player_name"] in ("张三", "李四")
    assert players[0]["set_win_count"] == 2
    assert players[0]["games_for"] == 13
    assert players[0]["games_against"] == 7
    assert players[0]["net_games"] == 6
    assert players[2]["rank"] == 2
    assert players[2]["set_win_count"] == 0
    assert players[2]["games_for"] == 7
    assert players[2]["net_games"] == -6

    team_rankings = await client.get("/api/v1/public/rankings/teams")
    assert team_rankings.status_code == 200
    teams = team_rankings.json()["data"]
    assert teams[0]["team_name"] == "住建部队"
    assert teams[0]["duel_win_count"] == 1
    assert teams[0]["set_win_count"] == 2
    assert teams[0]["games_for"] == 13
    assert teams[0]["games_against"] == 7
    assert teams[0]["net_games"] == 6
    assert teams[0]["opponent_results"] == ["人社部队 13:7 胜"]

    filtered_teams = await client.get(
        "/api/v1/public/rankings/teams",
        params={"team_id": team_b["id"]},
    )
    assert filtered_teams.status_code == 200
    assert filtered_teams.json()["total"] == 1
    assert filtered_teams.json()["data"][0]["team_name"] == "人社部队"
    assert filtered_teams.json()["data"][0]["rank"] == 2

    date_results = await client.get(
        "/api/v1/public/results",
        params={"match_date": "2026-06-09"},
    )
    assert date_results.status_code == 200
    assert date_results.json()["total"] == 1
    assert date_results.json()["data"][0]["match_date"] == "2026-06-09"
    assert date_results.json()["data"][0]["age_group"] == "A 组"

    month_rankings = await client.get(
        "/api/v1/public/rankings/teams",
        params={"match_month": "2026-06", "age_group": "A 组"},
    )
    assert month_rankings.status_code == 200
    month_teams = month_rankings.json()["data"]
    assert month_teams[0]["team_name"] == "住建部队"
    assert month_teams[0]["set_win_count"] == 1
    assert month_teams[0]["games_for"] == 6

    team_players = await client.get(
        "/api/v1/public/rankings/players",
        params={"scope": "team", "team_id": team_a["id"]},
    )
    assert team_players.status_code == 200
    assert team_players.json()["total"] == 2
    assert team_players.json()["data"][0]["team_rank"] == 1

    filtered_players = await client.get(
        "/api/v1/public/rankings/players",
        params={"team_id": team_b["id"]},
    )
    assert filtered_players.status_code == 200
    assert filtered_players.json()["total"] == 2
    assert filtered_players.json()["data"][0]["rank"] == 2

    missing_team_scope = await client.get(
        "/api/v1/public/rankings/players",
        params={"scope": "team"},
    )
    assert missing_team_scope.status_code == 422

    filter_options = await client.get("/api/v1/public/filter-options")
    assert filter_options.status_code == 200
    options = filter_options.json()["data"]
    assert "2026-06" in options["match_months"]
    assert "2026-06-09" in options["match_dates"]
    assert "A 组" in options["age_groups"]

    public_results = await client.get("/api/v1/public/results", params={"search": "张三"})
    assert public_results.status_code == 200
    assert public_results.json()["total"] == 2

    public_matches = await client.get("/api/v1/public/matches", params={"search": "1 号场"})
    assert public_matches.status_code == 200
    assert public_matches.json()["total"] == 1
