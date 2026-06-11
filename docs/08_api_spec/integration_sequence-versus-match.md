# 联调顺序：队伍对抗赛局分制

## 1. 原则

- 先确认 API 契约，再改后端实现。
- 排名必须由后端计算，前端不自行计算。
- 后台只录入对抗与比分，不手工录入积分。
- Excel 上传和手工录入应生成同一种比赛对抗数据。
- 公共端 table 只展示后端返回结果，不二次推导胜负和排名。

## 2. 后端接口开发顺序

### 第 1 批：模型与基础数据

- 更新 `CompetitionItem`：从 `item_type` 改为 `player_count`。
- 新增 `VersusMatch`。
- 新增 `VersusMatchPlayer`。
- 保留球队、球员、球队成员接口。

### 第 2 批：后台对抗赛录入

- `GET /api/v1/admin/matches`
- `POST /api/v1/admin/matches`
- `PUT /api/v1/admin/matches/{id}`
- `DELETE /api/v1/admin/matches/{id}`

校验重点：

- 双方队伍不能相同。
- 比分不能平局。
- 每侧球员数量符合项目配置。
- 球员必须属于对应队伍。
- 胜方自动计算。

### 第 3 批：公共比赛结果

- `GET /api/v1/public/matches`
- 兼容或替换 `GET /api/v1/public/results`

返回字段必须满足公共端 table：

```text
场地
年龄组
对阵
比分
胜方
```

### 第 4 批：排名计算

- `GET /api/v1/public/rankings/teams`
- `GET /api/v1/public/rankings/players`
- `GET /api/v1/admin/rankings/teams`
- `GET /api/v1/admin/rankings/players`

球队排名按：

```text
团体胜场数
加赛总分
相互对阵胜负
```

个人排名按：

```text
个人累计局分
个人胜场数
出场次数
```

### 第 5 批：Excel 上传

- 更新 Excel 模板字段。
- 更新上传解析逻辑。
- 更新预览字段。
- 更新确认导入逻辑。

接口沿用：

- `POST /api/v1/admin/uploads`
- `GET /api/v1/admin/uploads/{id}`
- `GET /api/v1/admin/uploads/{id}/preview`
- `POST /api/v1/admin/uploads/{id}/confirm`
- `POST /api/v1/admin/uploads/{id}/cancel`

### 第 6 批：后台概览

- `GET /api/v1/admin/dashboard`

字段改为：

```text
team_count
player_count
match_count
total_team_score
top_teams
top_players
```

## 3. 前端联调顺序

### 第 1 批：类型和 API 层

- 新增 `VersusMatch` 类型。
- 更新 `TeamRanking` 类型。
- 更新 `PlayerRanking` 类型。
- 新增 `admin/matches` API 调用。
- 更新公共端 matches API 调用。

### 第 2 批：公共端 table

- 比赛结果 table 改为：

```text
日期 | 场地 | 年龄组 | 对阵 | 比分 | 胜方
```

- 球队排名 table 改为：

```text
排名 | 球队 | 团体战绩 | 加赛总分 | 对阵成绩
```

- 个人排名 table 改为：

```text
排名 | 球员 | 所属队伍 | 出场 | 胜场 | 积分
```

### 第 3 批：后台录入表单

`ResultForm` 改为对抗赛录入：

```text
比赛日期
场地
组别
项目
队伍A
队伍A球员
队伍A得分
队伍B
队伍B球员
队伍B得分
备注
```

移除：

```text
名次
手工积分
个人/团队 scope
```

### 第 4 批：后台成绩管理

`AdminResults` 改为比赛对抗管理：

```text
日期 | 场地 | 年龄组 | 队伍A | 球员A | 队伍B | 球员B | 比分 | 胜方 | 操作
```

### 第 5 批：Excel 上传

- 上传控件不变。
- 预览表格字段改为对抗赛字段。
- 错误提示按新模板校验规则显示。

## 4. 测试数据建议

最小测试数据：

```text
3 支球队
每队至少 6-8 名球员
3 个双打组别
每两队之间至少 3 场比赛
总计 9 场比赛
```

需要覆盖：

- 队伍 A 胜。
- 队伍 B 胜。
- 同一队伍与多个队伍对抗。
- 同一球员多次出场。
- 落败方球员仍累计本方局分。
- 球队排名按团体胜负优先，而不是单场胜场优先。
- 个人排名同分并列。

## 5. 验收顺序

1. 后台能维护球队。
2. 后台能维护球员。
3. 后台能维护球队成员。
4. 后台能维护比赛项目 player_count。
5. 后台能手工录入一场对抗赛。
6. 系统能自动计算胜方。
7. 公共端能显示比赛结果 table。
8. 系统能计算球队团体战绩和加赛总分。
9. 公共端能显示球队排名 table。
10. 系统能计算个人累计局分。
11. 公共端能显示个人排名 table。
12. Excel 上传能解析、预览、确认导入。
13. 手机端公共端无横向溢出。

## 6. 暂不联调

- 球员主页。
- 球队主页。
- 数据导出。
- 操作日志。
- 多赛季。
- 多赛事切换。
