from pathlib import Path

import pytest
from httpx import AsyncClient
from openpyxl import Workbook

from tests.test_core_flow import create_base_data


@pytest.mark.asyncio
async def test_excel_upload_confirm(tmp_path: Path, client: AsyncClient, auth_headers: dict):
    team_a, team_b, p1, p2, p3, p4, item = await create_base_data(client, auth_headers)

    workbook = Workbook()
    sheet = workbook.active
    sheet.append([
        "比赛日期",
        "场序",
        "场地",
        "年龄组",
        "项目名称",
        "A队",
        "A队球员1",
        "A队球员2",
        "A队球员3",
        "A队球员4",
        "A队比分",
        "B队",
        "B队球员1",
        "B队球员2",
        "B队球员3",
        "B队球员4",
        "B队比分",
        "备注",
    ])
    sheet.append([
        "2026-06-09",
        1,
        "1 号场",
        "A 组",
        item["name"],
        team_a["name"],
        p1["name"],
        p2["name"],
        None,
        None,
        6,
        team_b["name"],
        p3["name"],
        p4["name"],
        None,
        None,
        4,
        None,
    ])
    file_path = tmp_path / "matches.xlsx"
    workbook.save(file_path)

    with file_path.open("rb") as fp:
        response = await client.post(
            "/api/v1/admin/uploads",
            files={
                "file": (
                    "matches.xlsx",
                    fp,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
            headers=auth_headers,
        )
    assert response.status_code == 201
    upload = response.json()["data"]
    assert upload["status"] == "parsed"
    assert upload["valid_rows"] == 1

    preview = await client.get(
        f"/api/v1/admin/uploads/{upload['id']}/preview",
        headers=auth_headers,
    )
    assert preview.status_code == 200
    row_number = preview.json()["data"][0]["row_number"]

    confirm = await client.post(
        f"/api/v1/admin/uploads/{upload['id']}/confirm",
        json={"confirmed_rows": [row_number], "ignored_rows": []},
        headers=auth_headers,
    )
    assert confirm.status_code == 200

    rankings = await client.get("/api/v1/public/rankings/players")
    assert rankings.json()["total"] == 4

    matches = await client.get("/api/v1/public/matches")
    assert matches.json()["total"] == 1
    assert matches.json()["data"][0]["score_text"] == "6:4"
    assert matches.json()["data"][0]["match_date"] == "2026-06-09"
    assert matches.json()["data"][0]["age_group"] == "A 组"
