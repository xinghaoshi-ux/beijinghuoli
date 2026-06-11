# 实体关系说明

## 1. 总览

本项目为单场赛事平台，核心关系围绕球员、球队、比赛项目、比赛结果和积分记录展开。

```text
Team 1 ── N Player
Team 1 ── N TeamMember
Player 1 ── N TeamMember

CompetitionItem 1 ── N MatchResult
MatchResult 1 ── N MatchResultPlayer
Player 1 ── N MatchResultPlayer

MatchResult 1 ── N PlayerPoints
Player 1 ── N PlayerPoints

MatchResult 1 ── N TeamPoints
Team 1 ── N TeamPoints

UploadBatch 1 ── N MatchResult
```

## 2. 关系详情

### 2.1 Team 与 Player

关系：一对多，可选关系。

说明：

- Player 可通过 `team_id` 记录默认所属球队。
- Player 也可以不绑定球队。
- 真实球队成员关系以 TeamMember 为准。

### 2.2 Team 与 TeamMember

关系：一对多。

说明：

- 一个球队可以有多名成员。
- 同一 team_id + player_id 建议唯一。
- 本项目是单场赛事，因此 TeamMember 不绑定赛季或赛事。

### 2.3 Player 与 TeamMember

关系：一对多。

说明：

- 一名球员在 MVP 中通常只属于一个球队。
- 如果后续支持多赛事，可扩展为同一球员在不同赛事属于不同球队。

### 2.4 CompetitionItem 与 MatchResult

关系：一对多。

说明：

- 一个比赛项目可以有多条结果。
- 例如一个项目下可记录冠军、亚军、第三名等多条结果。
- CompetitionItem.item_type 决定结果主要进入个人榜还是球队榜。

### 2.5 MatchResult 与 MatchResultPlayer

关系：一对多。

说明：

- 个人结果通过 MatchResultPlayer 关联球员。
- 单打一条结果关联一名球员。
- 双打一条结果关联两名球员。
- 多人组合结果也可以扩展支持。

### 2.6 MatchResult 与 Team

关系：多对一，可选关系。

说明：

- 球队结果通过 MatchResult.team_id 关联球队。
- 个人结果一般不需要 team_id。
- 团队或积分赛结果进入 TeamPoints。

### 2.7 MatchResult 与 PlayerPoints

关系：一对多。

说明：

- 个人结果确认后，可为关联球员生成 PlayerPoints。
- 本版球队积分不生成 PlayerPoints。
- 如果一条个人双打结果关联两名球员，默认每名球员各生成一条 PlayerPoints。

### 2.8 MatchResult 与 TeamPoints

关系：一对多。

说明：

- 球队结果确认后，为对应球队生成 TeamPoints。
- TeamPoints 是球队排名的数据来源。
- TeamPoints 不分摊到个人。

### 2.9 UploadBatch 与 MatchResult

关系：一对多。

说明：

- 一次 Excel 上传可以导入多条比赛结果。
- MatchResult.upload_batch_id 记录来源。
- 手工录入的结果 upload_batch_id 为空。

## 3. 关键唯一约束建议

| 表 | 唯一约束 | 说明 |
|---|---|---|
| teams | name | MVP 建议球队名称唯一 |
| players | name | MVP 可建议姓名唯一，但如存在重名需加备注区分 |
| team_members | team_id + player_id | 避免重复添加成员 |
| match_result_players | match_result_id + player_id | 避免同一结果重复关联同一球员 |

## 4. 查询索引建议

| 表 | 索引 | 用途 |
|---|---|---|
| players | name | 搜索球员 |
| teams | name | 搜索球队 |
| competition_items | name | 搜索项目 |
| match_results | item_id | 按项目查询结果 |
| match_results | result_scope | 区分个人/球队结果 |
| player_points | player_id | 个人积分汇总 |
| team_points | team_id | 球队积分汇总 |
| upload_batches | status | 查询上传状态 |

## 5. 后续扩展点

如后续要整合到年度积分系统，可扩展：

- 增加 Season。
- 增加 Tournament。
- TeamMember 增加 tournament_id。
- CompetitionItem 归属 Tournament。
- MatchResult 归属 Tournament。
- PlayerPoints 和 TeamPoints 增加 season_id、tournament_id。
