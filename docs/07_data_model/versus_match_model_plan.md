# 对抗赛局分制数据模型改造计划

## 1. 改造原因

当前系统按“项目 + 名次 + 积分”录入成绩，适合锦标赛排名制。

本次实际赛制是：

```text
队伍循环对抗制 + 局分累计制
```

因此不能继续让后台手工录入：

```text
名次
固定积分
个人/团队 scope
```

应改为录入每一场具体对抗：

```text
队伍 A
队伍 A 球员
队伍 A 得分
队伍 B
队伍 B 球员
队伍 B 得分
```

胜方、队伍局分、个人局分和排名由系统自动计算。

---

## 2. 新核心模型

## 2.1 VersusMatch

一条记录代表一场具体对抗。

字段建议：

```text
id
competition_id
item_id
match_date
sequence_no
court_name
group_name
team_a_id
team_b_id
team_a_score
team_b_score
winner_team_id
source_type
upload_batch_id
note
created_at
updated_at
```

约束：

```text
team_a_id != team_b_id
team_a_score >= 0
team_b_score >= 0
team_a_score != team_b_score
```

说明：

- `match_date` 表示比赛实际发生日期，格式为 `YYYY-MM-DD`。
- 公共端按日期、年月查询均基于 `match_date`。
- `winner_team_id` 由比分自动计算。
- 不建议后台手动选择胜方。
- 不再手动录入积分。
- `group_name` 在本轮产品文案中统一显示为“年龄组”。MVP 可先保留数据库字段名 `group_name`，API 和前端展示层使用 `age_group` 语义说明；后续如确需物理重命名，再单独做迁移。

---

## 2.2 VersusMatchPlayer

记录一场比赛中每名球员属于哪一方。

字段建议：

```text
id
match_id
player_id
team_id
side
created_at
```

约束：

```text
side in ("A", "B")
UniqueConstraint(match_id, player_id)
```

说明：

- 双打比赛中，每侧一般 2 名球员。
- 单打比赛中，每侧 1 名球员。
- 未来可通过 `CompetitionItem.player_count` 控制每侧人数。

---

## 3. CompetitionItem 改造

当前 `CompetitionItem.item_type` 更适合“个人/团体”分类。

本赛制建议改为：

```text
player_count
```

字段建议：

```text
id
competition_id
name
player_count
sort_order
note
```

示例：

| name | player_count |
|---|---:|
| 70岁组双打 | 2 |
| 90岁组双打 | 2 |
| 110岁组双打 | 2 |

---

## 4. 队伍排名计算

## 4.1 队伍累计局分

```text
team_total_score = 该队所有比赛中本队得分之和
```

示例：

```text
新赛道 = 18 + 13 = 31
环保部 = 11 + 13 = 24
人社部 = 6 + 11 = 17
```

## 4.2 团体战绩

先按两队之间聚合全部比赛比分，再判断团体胜负。

示例：

```text
新赛道 vs 人社部 = 18 : 6
新赛道 vs 环保部 = 13 : 11
环保部 vs 人社部 = 13 : 11
```

最终：

```text
新赛道 2胜0负
环保部 1胜1负
人社部 0胜2负
```

## 4.3 队伍排序

```text
1. 团体胜场数
2. 胜盘数
3. 胜局数
4. 净胜局
5. 仍相同则并列
```

---

## 5. 个人排名计算

个人排名不再使用“积分”概念，改为按胜盘、胜局、净胜局和出场次数排序。

```text
games_for = 球员所有出场比赛中，所在队伍本场得分之和
games_against = 球员所有出场比赛中，对方队伍本场得分之和
net_games = games_for - games_against
```

示例：

```text
倪虹 / 宋友春：
对环保部得 5 分
对人社部得 7 分
合计 12 分
```

个人排序：

```text
1. 个人胜盘数
2. 个人胜局数
3. 个人净胜局
4. 出场次数
5. 仍相同则并列
```

个人排名支持两种范围：

```text
global = 全局排名，统计全部符合筛选条件的球员
team = 队内排名，统计指定球队内符合筛选条件的球员
```

年龄筛选说明：

```text
MVP 阶段的“年龄筛选”按比赛年龄组筛选，例如 70岁组、90岁组、110岁组。
系统当前不按球员真实年龄或出生年份筛选。
```

---

## 6. API 返回结构建议

## 6.1 比赛结果

接口可沿用：

```text
GET /api/v1/public/results
```

或重命名为：

```text
GET /api/v1/public/matches
```

返回字段建议：

```text
id
match_date
sequence_no
court_name
group_name / age_group
item_name
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
```

## 6.2 球队排名

```text
GET /api/v1/public/rankings/teams
```

返回字段建议：

```text
rank
team_id
team_name
duel_win_count
duel_loss_count
set_win_count
set_loss_count
games_for
games_against
net_games
opponent_results
```

其中 `opponent_results`：

```text
opponent_team_name
result
score_for
score_against
```

## 6.3 个人排名

```text
GET /api/v1/public/rankings/players
```

返回字段建议：

```text
rank
player_id
player_name
team_id
team_name
appearance_count
set_win_count
set_loss_count
games_for
games_against
net_games
```

---

## 7. 后台录入表单变化

移除：

```text
scope
rank_label
rank_order
points
```

新增：

```text
match_date
sequence_no
court_name
group_name / 年龄组
item_id
team_a_id
team_a_player_ids
team_a_score
team_b_id
team_b_player_ids
team_b_score
note
```

胜方自动计算。

---

## 8. 需要弃用或重构

旧模型：

```text
MatchResult
MatchResultPlayer
PlayerPoints
TeamPoints
```

建议在新赛制中弃用或重构为自动计算日志。

保留：

```text
Team
Player
TeamMember
AdminUser
UploadBatch
```

---

## 9. 推荐实施顺序

```text
1. 确认公共端三张 table 字段
2. 更新 API 契约
3. 更新后端模型和计算服务
4. 更新后台录入表单
5. 更新 Excel 模板和上传解析
6. 更新公共端 table
7. 导入真实赛果并验证排名
```
