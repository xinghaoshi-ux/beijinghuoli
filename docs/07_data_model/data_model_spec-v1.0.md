# 数据模型规范 v1.0

## 1. 设计目标

本文定义“北京市活力网球交流系列赛赛果查看平台”MVP 阶段的数据模型。

设计目标：

- 支撑单场交流赛。
- 支撑公共端比赛结果查询、球队排名、个人排名。
- 支撑后台球队录入、球员录入、成绩录入。
- 支撑手工成绩录入和 Excel 上传。
- 保持模型轻量，后续可扩展到多赛事或整合回原年度积分系统。

## 2. 核心规则

- 本项目只有一个交流赛，不建赛季表。
- 本版不做多赛事切换。
- 比赛结果是事实数据。
- 积分记录是排名数据来源。
- 个人积分和球队积分分开存储、分开排名。
- 球队积分不分摊到个人。
- 同分并列，下一名跳号。
- 不做二次排名规则。
- 成绩允许记录比分，但比分字段可为空。

## 3. 实体清单

| 编号 | 实体 | 英文名 | 说明 |
|---|---|---|---|
| E-01 | 球员 | Player | 参赛人员基础信息 |
| E-02 | 球队 | Team | 参赛球队基础信息，临时队伍也作为球队记录 |
| E-03 | 球队成员 | TeamMember | 球队与球员的成员关系 |
| E-04 | 比赛项目 | CompetitionItem | 本次交流赛下的项目或组别 |
| E-05 | 比赛结果 | MatchResult | 某个项目中的成绩事实 |
| E-06 | 结果球员 | MatchResultPlayer | 某条个人结果关联的球员 |
| E-07 | 个人积分 | PlayerPoints | 个人排名的数据来源 |
| E-08 | 球队积分 | TeamPoints | 球队排名的数据来源 |
| E-09 | 上传记录 | UploadBatch | Excel 上传与解析记录 |
| E-10 | 管理员 | AdminUser | 后台登录用户，是否启用待确认 |

## 4. 实体详情

### 4.1 Player

业务含义：参赛球员基础信息。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | integer | 是 | 主键 |
| name | string | 是 | 球员姓名 |
| team_id | integer | 否 | 默认所属球队，可为空 |
| phone | string | 否 | 联系方式，后台字段 |
| note | string | 否 | 备注 |
| status | string | 是 | active / inactive |
| created_at | datetime | 是 | 创建时间 |
| updated_at | datetime | 否 | 更新时间 |

说明：

- 公共端不展示 phone。
- 球员可不绑定球队。
- 如果球员临时代表某球队参赛，可通过 TeamMember 体现。

### 4.2 Team

业务含义：参赛球队基础信息。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | integer | 是 | 主键 |
| name | string | 是 | 球队名称 |
| note | string | 否 | 备注 |
| status | string | 是 | active / inactive |
| created_at | datetime | 是 | 创建时间 |
| updated_at | datetime | 否 | 更新时间 |

说明：

- MVP 建议球队名称唯一，避免同名球队录入成多条记录。
- 临时队伍也录入 Team。
- 球队排名按 TeamPoints 聚合。

### 4.3 TeamMember

业务含义：球队成员关系。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | integer | 是 | 主键 |
| team_id | integer | 是 | 球队 ID |
| player_id | integer | 是 | 球员 ID |
| role | string | 否 | captain / member |
| is_active | boolean | 是 | 是否有效成员 |
| created_at | datetime | 是 | 创建时间 |

说明：

- 本项目是单场赛事，TeamMember 不需要绑定赛季。
- 后续如扩展到多赛事，可增加 event_id 或 tournament_id。
- 同一个 team_id + player_id 建议唯一。

### 4.4 CompetitionItem

业务含义：本次交流赛中的项目、组别或积分赛分类。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | integer | 是 | 主键 |
| name | string | 是 | 项目名称，例如男子双打、团体积分赛 |
| item_type | string | 是 | individual / team |
| display_order | integer | 否 | 前端展示顺序 |
| note | string | 否 | 备注 |
| created_at | datetime | 是 | 创建时间 |
| updated_at | datetime | 否 | 更新时间 |

说明：

- `individual` 用于个人排名来源。
- `team` 用于球队排名来源。
- “个人赛”和“积分赛”的最终枚举名称可在 Phase 4/5 继续确认。

### 4.5 MatchResult

业务含义：比赛结果事实记录。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | integer | 是 | 主键 |
| item_id | integer | 是 | 比赛项目 ID |
| result_scope | string | 是 | individual / team |
| rank_label | string | 否 | 名次或成绩标签，例如冠军、亚军、第 1 名 |
| rank_order | integer | 否 | 名次排序值 |
| team_id | integer | 否 | 球队结果时关联球队 |
| score_text | string | 否 | 比分文本，例如 6:4 / 2-1 |
| points | integer | 是 | 该结果产生的积分 |
| source_type | string | 是 | manual / excel |
| upload_batch_id | integer | 否 | 来源上传批次 |
| note | string | 否 | 备注 |
| created_at | datetime | 是 | 创建时间 |
| updated_at | datetime | 否 | 更新时间 |

说明：

- 个人结果通过 MatchResultPlayer 关联球员。
- 球队结果通过 team_id 关联球队。
- points 是该结果产生的积分。
- 个人结果写入 PlayerPoints。
- 球队结果写入 TeamPoints。

### 4.6 MatchResultPlayer

业务含义：个人比赛结果与球员的关联表，支持单打、双打或多人组合结果。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | integer | 是 | 主键 |
| match_result_id | integer | 是 | 比赛结果 ID |
| player_id | integer | 是 | 球员 ID |
| created_at | datetime | 是 | 创建时间 |

说明：

- 一条个人结果可以关联 1 名或多名球员。
- 对于双打结果，可关联两名球员。

### 4.7 PlayerPoints

业务含义：个人积分记录，是个人排名的数据来源。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | integer | 是 | 主键 |
| player_id | integer | 是 | 球员 ID |
| item_id | integer | 是 | 比赛项目 ID |
| match_result_id | integer | 否 | 来源结果 ID |
| points | integer | 是 | 获得积分 |
| description | string | 否 | 积分说明 |
| created_at | datetime | 是 | 创建时间 |

说明：

- 球队积分不写入 PlayerPoints。
- 个人排名按 PlayerPoints 聚合。
- 如果一条双打结果关联两名球员，本版建议每名球员各获得该结果积分。

### 4.8 TeamPoints

业务含义：球队积分记录，是球队排名的数据来源。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | integer | 是 | 主键 |
| team_id | integer | 是 | 球队 ID |
| item_id | integer | 是 | 比赛项目 ID |
| match_result_id | integer | 否 | 来源结果 ID |
| points | integer | 是 | 获得积分 |
| description | string | 否 | 积分说明 |
| created_at | datetime | 是 | 创建时间 |

说明：

- 球队排名按 TeamPoints 聚合。
- TeamPoints 不分摊到 PlayerPoints。
- 同一球队多条 TeamPoints 累加。

### 4.9 UploadBatch

业务含义：Excel 成绩上传批次。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | integer | 是 | 主键 |
| filename | string | 是 | 原始文件名 |
| file_path | string | 是 | 文件保存路径 |
| status | string | 是 | pending / parsed / imported / failed / cancelled |
| total_rows | integer | 否 | 总行数 |
| valid_rows | integer | 否 | 有效行数 |
| error_rows | integer | 否 | 错误行数 |
| preview_data | json | 否 | 解析预览 |
| error_log | text | 否 | 错误信息 |
| created_at | datetime | 是 | 创建时间 |

说明：

- Excel 上传先生成 UploadBatch。
- 解析完成后展示 preview_data。
- 管理员确认后写入 MatchResult、PlayerPoints、TeamPoints。

### 4.10 AdminUser

业务含义：后台管理员。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | integer | 是 | 主键 |
| username | string | 是 | 登录名 |
| password_hash | string | 是 | 密码哈希 |
| display_name | string | 否 | 显示名 |
| status | string | 是 | active / inactive |
| created_at | datetime | 是 | 创建时间 |

说明：

- 是否启用后台登录仍为待确认项。
- 如果 MVP 不启用登录，可暂缓实现 AdminUser。

## 5. 排名计算

### 5.1 个人排名

数据来源：PlayerPoints。

计算方式：

```text
按 player_id 分组，SUM(points) 得到 total_points。
按 total_points DESC 使用 RANK 排名。
同分并列，下一名跳号。
```

输出建议：

- ranking
- player_id
- player_name
- team_name
- total_points
- result_count

### 5.2 球队排名

数据来源：TeamPoints。

计算方式：

```text
按 team_id 分组，SUM(points) 得到 total_points。
按 total_points DESC 使用 RANK 排名。
同分并列，下一名跳号。
```

输出建议：

- ranking
- team_id
- team_name
- total_points
- result_count

## 6. 搜索规则

公共端搜索支持关键词：

- 球员姓名
- 球队名称
- 比赛项目名称
- 成绩标签
- 备注

本版搜索只做关键词匹配，不做复杂筛选。

## 7. 待确认项

- 成绩是否必须记录比分。
- Excel 上传模板字段。
- 后台是否启用登录。
- MVP 是否确定 SQLite。
- 个人赛双打结果是否每名球员都获得完整积分。
