# API 规范 v2.0：队伍对抗赛局分制

## 1. 版本说明

本规范用于替代 v1.0 中基于“项目 + 名次 + 固定积分”的成绩接口。

v2.0 的核心赛制为：

```text
队伍循环对抗制 + 局分累计制
```

核心变化：

- 后台不再录入 `rank_label`、`rank_order`、`points`。
- 后台录入每场对抗双方、双方球员和比分。
- 胜方、球队累计局分、个人累计局分、球队排名、个人排名由后端自动计算。
- 公共端 table 展示比赛对阵、团体战绩和个人累计局分。
- v2.1 起，比赛对抗增加 `match_date`，公共端支持按年月、比赛日期、球队和年龄组筛选。
- v2.1 起，后台和公共端文案统一将 `group_name` 展示为“年龄组”；接口可继续兼容 `group_name`，新增文档语义使用 `age_group`。

## 2. 通用约定

| 项目 | 值 |
|---|---|
| Base URL | `/api/v1` |
| 公共接口前缀 | `/api/v1/public` |
| 后台接口前缀 | `/api/v1/admin` |
| 内容类型 | `application/json` |
| 文件上传 | `multipart/form-data` |
| 后台认证 | Bearer Token |
| 分页参数 | `page`、`page_size` |

说明：

- 当前仍沿用 `/api/v1` 作为服务 Base URL，避免同时改动部署路径。
- 文档版本为 v2.0，表示业务契约版本升级。

## 3. 通用响应

### 3.1 单对象响应

```json
{
  "data": {},
  "message": "ok"
}
```

### 3.2 列表响应

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "page_size": 50
}
```

### 3.3 错误响应

```json
{
  "detail": "错误描述",
  "code": "ERROR_CODE"
}
```

## 4. 公共接口

### 4.1 获取赛事信息

沿用 v1.0：

```text
GET /public/event-info
```

响应：

```json
{
  "data": {
    "name": "北京市活力网球交流系列赛",
    "subtitle": "赛果查看平台",
    "description": null
  }
}
```

命名规则：

- 实施阶段所有旧赛事名称位置，统一替换为 `北京市活力网球交流系列赛`。
- 本版页面底部署名也统一显示为 `北京市活力网球交流系列赛`。

### 4.2 获取公共筛选项

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/public/filter-options` |
| 用途 | 公共端获取真实可用的筛选下拉选项 |
| 认证 | 无 |

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| match_month | string | 否 | `YYYY-MM`，传入后 `match_dates` 仅返回该月有比赛的日期 |
| team_id | integer | 否 | 传入后日期和年龄组可按该队过滤 |

响应：

```json
{
  "data": {
    "match_months": ["2026-06", "2026-05"],
    "match_dates": ["2026-06-09", "2026-06-02"],
    "teams": [
      { "id": 1, "name": "新赛道网球队", "short_name": "新赛道" }
    ],
    "age_groups": ["70岁组", "90岁组", "110岁组"]
  }
}
```

说明：

- 下拉菜单选项必须来自该接口或其他真实后端接口，前端不得自行伪造。
- `match_months` 和 `match_dates` 基于 `VersusMatch.match_date` 去重生成。
- `age_groups` MVP 阶段基于比赛年龄组生成，对应当前兼容字段 `group_name`。

### 4.3 查询比赛结果

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 推荐路径 | `/public/matches` |
| 兼容路径 | `/public/results` |
| 用途 | 公共端查询每场队伍对抗结果 |
| 认证 | 无 |

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| page | integer | 否 | 默认 1 |
| page_size | integer | 否 | 默认 50，最大 100 |
| search | string | 否 | 搜索球队、球员、场地、年龄组、备注 |
| match_date | string | 否 | 按比赛日期筛选，格式 `YYYY-MM-DD` |
| match_month | string | 否 | 按比赛年月筛选，格式 `YYYY-MM` |
| team_id | integer | 否 | 按球队筛选 |
| player_id | integer | 否 | 按球员筛选 |
| court_name | string | 否 | 按场地筛选 |
| age_group | string | 否 | 按年龄组筛选，推荐参数 |
| group_name | string | 否 | 按年龄组筛选，兼容旧参数 |

响应：

```json
{
  "data": [
    {
      "id": 1,
      "match_date": "2026-06-09",
      "sequence_no": 1,
      "court_name": "1号场地",
      "group_name": "110岁组",
      "age_group": "110岁组",
      "item_id": 1,
      "item_name": "110岁组双打",
      "team_a_id": 1,
      "team_a_name": "新赛道网球队",
      "team_a_players": [
        { "id": 1, "name": "倪虹", "team_id": 1, "team_name": "新赛道网球队" },
        { "id": 2, "name": "宋友春", "team_id": 1, "team_name": "新赛道网球队" }
      ],
      "team_a_score": 5,
      "team_b_id": 2,
      "team_b_name": "环保部网球队",
      "team_b_players": [
        { "id": 3, "name": "杨朝飞", "team_id": 2, "team_name": "环保部网球队" },
        { "id": 4, "name": "崔铁成", "team_id": 2, "team_name": "环保部网球队" }
      ],
      "team_b_score": 3,
      "winner_team_id": 1,
      "winner_team_name": "新赛道网球队",
      "note": null
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50
}
```

### 4.4 查询球队排名

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/public/rankings/teams` |
| 用途 | 公共端查询球队团体排名 |
| 认证 | 无 |

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| page | integer | 否 | 默认 1 |
| page_size | integer | 否 | 默认 50，最大 100 |
| search | string | 否 | 搜索球队名称 |
| team_id | integer | 否 | 按球队过滤展示，排名数字保留全局总榜名次 |
| match_month | string | 否 | 按比赛年月限定统计范围，格式 `YYYY-MM` |
| match_date | string | 否 | 按比赛日期限定统计范围，格式 `YYYY-MM-DD` |
| age_group | string | 否 | 按年龄组限定统计范围 |

公共端页面只使用 `search` 和 `team_id` 查询最新球队总榜；月份、比赛日期、年龄组筛选只用于比赛结果查询。筛选球队时，只缩小返回列表，不重新计算排名。

响应：

```json
{
  "data": [
    {
      "rank": 1,
      "team_id": 1,
      "team_name": "新赛道网球队",
      "duel_win_count": 2,
      "duel_loss_count": 0,
      "set_win_count": 5,
      "set_loss_count": 1,
      "games_for": 31,
      "games_against": 17,
      "net_games": 14,
      "opponent_results": [
        {
          "opponent_team_id": 2,
          "opponent_team_name": "环保部网球队",
          "result": "win",
          "score_for": 13,
          "score_against": 11
        },
        {
          "opponent_team_id": 3,
          "opponent_team_name": "人社部网球队",
          "result": "win",
          "score_for": 18,
          "score_against": 6
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50
}
```

字段说明：

| 字段 | 含义 |
|---|---|
| rank | 全局总榜排名，支持并列；筛选后不重新计算 |
| duel_win_count | 团体对抗胜场，按两队之间总比分计算 |
| duel_loss_count | 团体对抗负场 |
| set_win_count | 胜盘数，每条比赛记录为 1 盘 |
| set_loss_count | 负盘数 |
| games_for | 胜局数，即球队累计本方局分 |
| games_against | 负局数，即球队累计对方局分 |
| net_games | 净胜局，`games_for - games_against` |
| opponent_results | 对阵成绩 |

排序规则：

```text
1. duel_win_count desc
2. set_win_count desc
3. games_for desc
4. net_games desc
5. 仍相同则并列
```

排名显示使用 dense ranking：并列后不跳号，例如 `1、1、2、3`。

### 4.5 查询个人排名

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/public/rankings/players` |
| 用途 | 公共端查询个人排名 |
| 认证 | 无 |

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| page | integer | 否 | 默认 1 |
| page_size | integer | 否 | 默认 50，最大 100 |
| search | string | 否 | 搜索球员姓名或球队名称 |
| scope | string | 否 | 兼容旧参数，公共端页面不再使用 |
| team_id | integer | 否 | 按球队过滤展示，排名数字保留全局总榜名次 |
| match_month | string | 否 | 按比赛年月限定统计范围，格式 `YYYY-MM` |
| match_date | string | 否 | 按比赛日期限定统计范围，格式 `YYYY-MM-DD` |
| age_group | string | 否 | 按年龄组限定统计范围 |

公共端页面只使用 `search` 和 `team_id` 查询最新个人总榜；不再提供“全局排名 / 队内排名”切换。月份、比赛日期、年龄组筛选只用于比赛结果查询。筛选球队时，只缩小返回列表，不重新计算排名。

响应：

```json
{
  "data": [
    {
      "rank": 1,
      "global_rank": 1,
      "team_rank": 1,
      "player_id": 1,
      "player_name": "倪虹",
      "team_id": 1,
      "team_name": "新赛道网球队",
      "appearance_count": 2,
      "set_win_count": 2,
      "set_loss_count": 0,
      "games_for": 12,
      "games_against": 4,
      "net_games": 8
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50
}
```

字段说明：

| 字段 | 含义 |
|---|---|
| rank | 全局总榜排名，支持并列；筛选后不重新计算 |
| global_rank | 兼容字段，等同全局总榜排名 |
| team_rank | 兼容字段，公共端页面不展示 |
| appearance_count | 出场次数 |
| set_win_count | 个人胜盘数 |
| set_loss_count | 个人负盘数 |
| games_for | 个人胜局数，即出场比赛中本方累计局分 |
| games_against | 个人负局数，即出场比赛中对方累计局分 |
| net_games | 个人净胜局，`games_for - games_against` |

排序规则：

```text
1. set_win_count desc
2. games_for desc
3. net_games desc
4. appearance_count desc
5. 仍相同则并列
```

排名显示使用 dense ranking：并列后不跳号，例如 `1、1、2、3`。

## 5. 后台比赛项目接口

### 5.1 查询比赛项目

```text
GET /admin/items
```

响应：

```json
{
  "data": [
    {
      "id": 1,
      "name": "110岁组双打",
      "player_count": 2,
      "sort_order": 1,
      "note": null
    }
  ]
}
```

### 5.2 新建比赛项目

```text
POST /admin/items
```

请求：

```json
{
  "name": "110岁组双打",
  "player_count": 2,
  "sort_order": 1,
  "note": null
}
```

### 5.3 更新比赛项目

```text
PUT /admin/items/{item_id}
```

请求字段同新建比赛项目。

## 6. 后台对抗赛接口

### 6.1 查询比赛对抗列表

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 推荐路径 | `/admin/matches` |
| 兼容路径 | `/admin/results` |
| 用途 | 后台查询比赛对抗记录 |

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| page | integer | 否 | 默认 1 |
| page_size | integer | 否 | 默认 20，最大 100 |
| search | string | 否 | 搜索球队、球员、场地、年龄组、备注 |
| match_date | string | 否 | 按比赛日期筛选，格式 `YYYY-MM-DD` |
| match_month | string | 否 | 按比赛年月筛选，格式 `YYYY-MM` |
| team_id | integer | 否 | 按球队筛选 |
| player_id | integer | 否 | 按球员筛选 |
| court_name | string | 否 | 按场地筛选 |
| age_group | string | 否 | 按年龄组筛选，推荐参数 |
| group_name | string | 否 | 按年龄组筛选，兼容旧参数 |
| winner_team_id | integer | 否 | 按胜方筛选 |

响应结构同公共比赛结果，可额外返回：

```json
{
  "match_date": "2026-06-09",
  "source_type": "manual",
  "upload_batch_id": null,
  "created_at": "2026-06-09T10:00:00",
  "updated_at": "2026-06-09T10:00:00"
}
```

### 6.2 手工创建比赛对抗

```text
POST /admin/matches
```

请求：

```json
{
  "match_date": "2026-06-09",
  "sequence_no": 1,
  "court_name": "1号场地",
  "group_name": "110岁组",
  "age_group": "110岁组",
  "item_id": 1,
  "team_a_id": 1,
  "team_a_player_ids": [1, 2],
  "team_a_score": 5,
  "team_b_id": 2,
  "team_b_player_ids": [3, 4],
  "team_b_score": 3,
  "note": null
}
```

响应：

```json
{
  "data": {
    "id": 1,
    "sequence_no": 1,
    "winner_team_id": 1,
    "winner_team_name": "新赛道网球队"
  },
  "message": "ok"
}
```

校验规则：

```text
team_a_id != team_b_id
team_a_score >= 0
team_b_score >= 0
team_a_score != team_b_score
team_a_player_ids.length == item.player_count
team_b_player_ids.length == item.player_count
team_a_player_ids 与 team_b_player_ids 不可重复
球员必须属于对应队伍，或至少当前 TeamMember 中存在有效绑定
```

### 6.3 更新比赛对抗

```text
PUT /admin/matches/{match_id}
```

请求结构同创建比赛对抗。

说明：

- 更新比分后需要重新计算胜方。
- 排名接口必须基于最新数据实时计算或刷新缓存。

### 6.4 删除比赛对抗

```text
DELETE /admin/matches/{match_id}
```

说明：

- 删除后排名自动更新。
- 若后续启用操作日志，可记录删除来源和操作人。

## 7. 后台排名接口

后台排名接口字段与公共端一致：

```text
GET /admin/rankings/teams
GET /admin/rankings/players
```

后台可增加调试字段，例如：

```text
match_ids
last_calculated_at
```

MVP 阶段可先不返回调试字段。

请求参数：

- `/admin/rankings/teams` 与 `/public/rankings/teams` 保持一致。
- `/admin/rankings/players` 与 `/public/rankings/players` 保持一致。
- 公共端排名页只发送 `search`、`team_id`；比赛时间和年龄组筛选只用于比赛结果页。

## 8. Excel 上传接口

沿用上传批次接口：

```text
POST /admin/uploads
GET /admin/uploads/{upload_id}
GET /admin/uploads/{upload_id}/preview
POST /admin/uploads/{upload_id}/confirm
POST /admin/uploads/{upload_id}/cancel
```

但 Excel 行解析字段改为对抗赛字段，详见：

```text
docs/08_api_spec/excel_template-versus-match.md
```

## 9. 后台概览接口

```text
GET /admin/dashboard
```

响应建议：

```json
{
  "data": {
    "team_count": 3,
    "player_count": 24,
    "match_count": 9,
    "total_team_score": 72,
    "top_teams": [],
    "top_players": []
  }
}
```

字段说明：

| 字段 | 含义 |
|---|---|
| match_count | 对抗赛记录数 |
| total_team_score | 所有比赛双方局分总和 |
| top_teams | 字段同球队排名 |
| top_players | 字段同个人排名 |

## 10. 与 v1.0 的字段差异

废弃字段：

```text
result_scope
rank_label
rank_order
points
score_text
players
team
result_count
total_points
```

新增字段：

```text
match_date
sequence_no
court_name
group_name
age_group
team_a_id
team_a_name
team_a_players
team_a_score
team_b_id
team_b_name
team_b_players
team_b_score
winner_team_id
winner_team_name
duel_win_count
duel_loss_count
set_win_count
set_loss_count
games_for
games_against
net_games
appearance_count
global_rank
team_rank
opponent_results
```
